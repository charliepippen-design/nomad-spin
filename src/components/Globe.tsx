import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function Earth({ spinning, spinSpeed }: { spinning: boolean; spinSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);
  const speedRef = useRef(0.005);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (spinning) {
      speedRef.current = THREE.MathUtils.lerp(speedRef.current, spinSpeed, 0.02);
    } else {
      speedRef.current = THREE.MathUtils.lerp(speedRef.current, 0.005, 0.03);
    }
    meshRef.current.rotation.y += speedRef.current * delta * 60;
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = meshRef.current.rotation.y;
    }
  });

  const earthMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a3a5c'),
      emissive: new THREE.Color('#0a1628'),
      emissiveIntensity: 0.3,
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.0, 0.83, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
  }, []);

  // Create continent-like patches using instanced geometry
  const continentPoints = useMemo(() => {
    const points: THREE.Matrix4[] = [];
    // Rough continent outlines as lat/lng clusters
    const regions = [
      // North America
      ...Array.from({ length: 80 }, () => ({ lat: 30 + Math.random() * 30, lng: -120 + Math.random() * 60 })),
      // South America
      ...Array.from({ length: 60 }, () => ({ lat: -40 + Math.random() * 50, lng: -80 + Math.random() * 30 })),
      // Europe
      ...Array.from({ length: 60 }, () => ({ lat: 40 + Math.random() * 25, lng: -10 + Math.random() * 40 })),
      // Africa
      ...Array.from({ length: 70 }, () => ({ lat: -30 + Math.random() * 60, lng: -15 + Math.random() * 50 })),
      // Asia
      ...Array.from({ length: 100 }, () => ({ lat: 10 + Math.random() * 55, lng: 50 + Math.random() * 100 })),
      // Australia
      ...Array.from({ length: 40 }, () => ({ lat: -35 + Math.random() * 20, lng: 115 + Math.random() * 35 })),
    ];
    
    regions.forEach(({ lat, lng }) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = 2.02;
      const x = -r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      const matrix = new THREE.Matrix4();
      const scale = 0.03 + Math.random() * 0.05;
      matrix.makeTranslation(x, y, z);
      matrix.scale(new THREE.Vector3(scale, scale, 0.01));
      points.push(matrix);
    });
    return points;
  }, []);

  const continentMesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 6, 6);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({
      color: new THREE.Color('#00d4ff'),
      emissive: new THREE.Color('#00d4ff'),
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.7,
    }), continentPoints.length);
    continentPoints.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [continentPoints]);

  return (
    <group>
      {/* Main globe */}
      <mesh ref={meshRef} material={earthMaterial}>
        <sphereGeometry args={[2, 64, 64]} />
        <primitive object={continentMesh} attach={undefined} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} material={atmosphereMaterial}>
        <sphereGeometry args={[2.15, 64, 64]} />
      </mesh>
      {/* Grid lines */}
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[2.01, 36, 18]} />
        <meshBasicMaterial wireframe color="#00d4ff" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null!);
  
  const [positions, sizes] = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = Math.random() * 3 + 1;
    }
    return [pos, sizes];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00d4ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function CameraRig({ spinning }: { spinning: boolean }) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (!spinning) {
      camera.position.lerp(new THREE.Vector3(0, 0.5, 6), 0.01);
    }
  });
  
  return null;
}

interface GlobeProps {
  spinning?: boolean;
  spinSpeed?: number;
}

export default function Globe({ spinning = false, spinSpeed = 0.005 }: GlobeProps) {
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
          <FloatingParticles />
          <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          <CameraRig spinning={spinning} />
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
