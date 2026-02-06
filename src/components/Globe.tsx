import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ── Fresnel Atmosphere Glow ── */
function AtmosphereGlow() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
        vec3 cyan = vec3(0.0, 0.83, 1.0);
        gl_FragColor = vec4(cyan, fresnel * 0.7);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  return (
    <mesh material={mat}>
      <sphereGeometry args={[2.25, 64, 64]} />
    </mesh>
  );
}

/* ── Pulsing City Markers ── */
function CityMarkers({ spinning, spinSpeed }: { spinning: boolean; spinSpeed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const timeRef = useRef(0);

  const positions = useMemo(() => {
    const regions = [
      ...Array.from({ length: 80 }, () => ({ lat: 30 + Math.random() * 30, lng: -120 + Math.random() * 60 })),
      ...Array.from({ length: 60 }, () => ({ lat: -40 + Math.random() * 50, lng: -80 + Math.random() * 30 })),
      ...Array.from({ length: 60 }, () => ({ lat: 40 + Math.random() * 25, lng: -10 + Math.random() * 40 })),
      ...Array.from({ length: 70 }, () => ({ lat: -30 + Math.random() * 60, lng: -15 + Math.random() * 50 })),
      ...Array.from({ length: 100 }, () => ({ lat: 10 + Math.random() * 55, lng: 50 + Math.random() * 100 })),
      ...Array.from({ length: 40 }, () => ({ lat: -35 + Math.random() * 20, lng: 115 + Math.random() * 35 })),
    ];
    return regions.map(({ lat, lng }) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = 2.02;
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
    });
  }, []);

  const count = positions.length;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;
    const stretch = spinning ? 1 + spinSpeed * 5 : 1;

    for (let i = 0; i < count; i++) {
      const p = positions[i];
      dummy.position.copy(p);
      const pulse = 0.03 + Math.sin(t * 3 + i * 0.5) * 0.015;
      dummy.scale.set(pulse * stretch, pulse, pulse);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#00d4ff"
        emissiveIntensity={0.6}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
}

/* ── Earth Mesh ── */
function Earth({ spinning, spinSpeed }: { spinning: boolean; spinSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const speedRef = useRef(0.005);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    speedRef.current = THREE.MathUtils.lerp(
      speedRef.current,
      spinning ? spinSpeed : 0.005,
      spinning ? 0.02 : 0.03
    );
    meshRef.current.rotation.y += speedRef.current * delta * 60;
  });

  const earthMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1a3a5c'),
    emissive: new THREE.Color('#0a1628'),
    emissiveIntensity: 0.3,
    roughness: 0.8,
    metalness: 0.1,
  }), []);

  return (
    <group>
      <mesh ref={meshRef} material={earthMat}>
        <sphereGeometry args={[2, 64, 64]} />
        <CityMarkers spinning={spinning} spinSpeed={speedRef.current} />
      </mesh>
      {/* Wireframe grid */}
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[2.01, 36, 18]} />
        <meshBasicMaterial wireframe color="#00d4ff" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

/* ── Floating Particles ── */
function FloatingParticles() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00d4ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ── Camera Rig ── */
function CameraRig({ spinning, resetCamera }: { spinning: boolean; resetCamera: boolean }) {
  const { camera } = useThree();
  const idlePos = useMemo(() => new THREE.Vector3(0, 0.5, 6), []);

  useFrame(() => {
    if (!spinning || resetCamera) {
      camera.position.lerp(idlePos, resetCamera ? 0.05 : 0.01);
    }
  });

  return null;
}

/* ── Main Globe ── */
interface GlobeProps {
  spinning?: boolean;
  spinSpeed?: number;
  resetCamera?: boolean;
}

export default function Globe({ spinning = false, spinSpeed = 0.005, resetCamera = false }: GlobeProps) {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        aria-label="Interactive Globe showing digital nomad destinations"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 3, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[-5, -3, -5]} intensity={0.3} color="#00d4ff" />
          <Earth spinning={spinning} spinSpeed={spinSpeed} />
          <AtmosphereGlow />
          <FloatingParticles />
          <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1.5} />
          <CameraRig spinning={spinning} resetCamera={resetCamera} />
          {!spinning && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={(3 * Math.PI) / 4}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
