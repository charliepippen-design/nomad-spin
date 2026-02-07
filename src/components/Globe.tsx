import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { cities } from '@/data/cities';

/* ── Convert lat/lng to 3D position ── */
function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

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
        vec3 col = vec3(0.4, 0.6, 1.0);
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
      <sphereGeometry args={[2.15, 64, 64]} />
    </mesh>
  );
}

/* ── City markers from actual data ── */
function CityMarkers({ spinning, spinSpeed }: { spinning: boolean; spinSpeed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const timeRef = useRef(0);

  const positions = useMemo(() => {
    return cities.map(city => latLngToVec3(city.lat, city.lng, 2.02));
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
      const pulse = 0.025 + Math.sin(t * 2 + i * 0.5) * 0.01;
      dummy.scale.set(pulse * stretch, pulse, pulse);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#00ffaa"
        emissive="#00ffaa"
        emissiveIntensity={0.8}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}

/* ── Earth with texture ── */
function Earth({ spinning, spinSpeed }: { spinning: boolean; spinSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const speedRef = useRef(0.003);

  const texture = useLoader(THREE.TextureLoader, '/textures/earth-night.jpg');

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
  }, [texture]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    speedRef.current = THREE.MathUtils.lerp(
      speedRef.current,
      spinning ? spinSpeed : 0.003,
      spinning ? 0.03 : 0.02
    );
    meshRef.current.rotation.y += speedRef.current * delta * 60;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0.05}
          emissiveMap={texture}
          emissive={new THREE.Color('#ffffff')}
          emissiveIntensity={0.4}
        />
        <CityMarkers spinning={spinning} spinSpeed={speedRef.current} />
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
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 3, 5]} intensity={0.8} color="#ffffff" />
          <pointLight position={[-5, -3, -5]} intensity={0.2} color="#4488ff" />
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
