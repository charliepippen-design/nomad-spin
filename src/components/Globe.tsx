import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ── Subtle atmosphere ring ── */
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
        float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 4.0);
        vec3 col = vec3(0.4, 0.6, 1.0); // subtle blue-white
        gl_FragColor = vec4(col, fresnel * 0.35);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  return (
    <mesh material={mat}>
      <sphereGeometry args={[2.2, 64, 64]} />
    </mesh>
  );
}

/* ── Minimal city markers ── */
function CityMarkers({ spinning, spinSpeed }: { spinning: boolean; spinSpeed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const timeRef = useRef(0);

  const positions = useMemo(() => {
    const regions = [
      ...Array.from({ length: 40 }, () => ({ lat: 30 + Math.random() * 30, lng: -120 + Math.random() * 60 })),
      ...Array.from({ length: 30 }, () => ({ lat: -40 + Math.random() * 50, lng: -80 + Math.random() * 30 })),
      ...Array.from({ length: 30 }, () => ({ lat: 40 + Math.random() * 25, lng: -10 + Math.random() * 40 })),
      ...Array.from({ length: 35 }, () => ({ lat: -30 + Math.random() * 60, lng: -15 + Math.random() * 50 })),
      ...Array.from({ length: 50 }, () => ({ lat: 10 + Math.random() * 55, lng: 50 + Math.random() * 100 })),
      ...Array.from({ length: 20 }, () => ({ lat: -35 + Math.random() * 20, lng: 115 + Math.random() * 35 })),
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

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;
    const stretch = spinning ? 1 + spinSpeed * 4 : 1;

    for (let i = 0; i < count; i++) {
      const p = positions[i];
      dummy.position.copy(p);
      const pulse = 0.02 + Math.sin(t * 2 + i * 0.3) * 0.008;
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
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.4}
        transparent
        opacity={0.5}
      />
    </instancedMesh>
  );
}

/* ── Earth ── */
function Earth({ spinning, spinSpeed }: { spinning: boolean; spinSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const speedRef = useRef(0.003);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    speedRef.current = THREE.MathUtils.lerp(
      speedRef.current,
      spinning ? spinSpeed : 0.003,
      spinning ? 0.03 : 0.02
    );
    meshRef.current.rotation.y += speedRef.current * delta * 60;
  });

  const earthMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0d1117'),
    emissive: new THREE.Color('#080c12'),
    emissiveIntensity: 0.2,
    roughness: 0.9,
    metalness: 0.05,
  }), []);

  return (
    <group>
      <mesh ref={meshRef} material={earthMat}>
        <sphereGeometry args={[2, 64, 64]} />
        <CityMarkers spinning={spinning} spinSpeed={speedRef.current} />
      </mesh>
      {/* Minimal wireframe */}
      <mesh>
        <sphereGeometry args={[2.01, 48, 24]} />
        <meshBasicMaterial wireframe color="#ffffff" transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

/* ── Camera Rig ── */
function CameraRig({ spinning, resetCamera }: { spinning: boolean; resetCamera: boolean }) {
  const { camera } = useThree();
  const idlePos = useMemo(() => new THREE.Vector3(0, 0.3, 5.5), []);

  useFrame(() => {
    if (!spinning || resetCamera) {
      camera.position.lerp(idlePos, resetCamera ? 0.06 : 0.008);
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

export default function Globe({ spinning = false, spinSpeed = 0.003, resetCamera = false }: GlobeProps) {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.3, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        aria-label="Interactive Globe showing digital nomad destinations"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <directionalLight position={[5, 3, 5]} intensity={0.6} color="#ffffff" />
          <pointLight position={[-5, -3, -5]} intensity={0.15} color="#4488ff" />
          <Earth spinning={spinning} spinSpeed={spinSpeed} />
          <AtmosphereGlow />
          <Stars radius={60} depth={60} count={3000} factor={3} saturation={0} fade speed={0.3} />
          <CameraRig spinning={spinning} resetCamera={resetCamera} />
          {!spinning && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.15}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={(3 * Math.PI) / 4}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
