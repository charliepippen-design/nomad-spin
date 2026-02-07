import { useRef, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader, ThreeEvent } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { cities, type City } from '@/data/cities';

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

/* ── City markers using R3F built-in pointer events ── */
function CityMarkers({
  spinning,
  spinSpeed,
  onHover,
  onUnhover,
}: {
  spinning: boolean;
  spinSpeed: number;
  onHover: (city: City, screenPos: { x: number; y: number }) => void;
  onUnhover: () => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const timeRef = useRef(0);
  const hoveredRef = useRef<number | null>(null);

  const positions = useMemo(() => {
    return cities.map(city => latLngToVec3(city.lat, city.lng, 2.06));
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
      const isHovered = hoveredRef.current === i;
      const baseSize = isHovered ? 0.05 : 0.028;
      const pulse = baseSize + Math.sin(t * 2 + i * 0.5) * 0.008;
      dummy.scale.set(pulse * stretch, pulse, pulse);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // R3F's built-in pointer events handle raycasting automatically
  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (spinning) return;
    e.stopPropagation();
    const idx = e.instanceId;
    if (idx !== undefined && idx < cities.length) {
      hoveredRef.current = idx;
      onHover(cities[idx], { x: e.clientX, y: e.clientY });
      document.body.style.cursor = 'pointer';
    }
  }, [spinning, onHover]);

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoveredRef.current = null;
    onUnhover();
    document.body.style.cursor = 'auto';
  }, [onUnhover]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (spinning) return;
    e.stopPropagation();
    const idx = e.instanceId;
    if (idx !== undefined && idx < cities.length) {
      if (hoveredRef.current !== idx) {
        hoveredRef.current = idx;
      }
      onHover(cities[idx], { x: e.clientX, y: e.clientY });
    }
  }, [spinning, onHover]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerMove={handlePointerMove}
    >
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
function Earth({
  spinning,
  spinSpeed,
  dayMode,
  onHover,
  onUnhover,
}: {
  spinning: boolean;
  spinSpeed: number;
  dayMode: boolean;
  onHover: (city: City, screenPos: { x: number; y: number }) => void;
  onUnhover: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const speedRef = useRef(0.003);

  const nightTexture = useLoader(THREE.TextureLoader, '/textures/earth-night.jpg');
  const dayTexture = useLoader(THREE.TextureLoader, '/textures/earth-day.jpg');

  useMemo(() => {
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.anisotropy = 4;
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    dayTexture.anisotropy = 4;
  }, [nightTexture, dayTexture]);

  const texture = dayMode ? dayTexture : nightTexture;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    speedRef.current = THREE.MathUtils.lerp(
      speedRef.current,
      spinning ? spinSpeed : 0.003,
      spinning ? 0.03 : 0.02
    );
    groupRef.current.rotation.y += speedRef.current * delta * 60;
  });

  return (
    <group ref={groupRef}>
      {/* Earth sphere */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={dayMode ? 0.7 : 0.85}
          metalness={0.05}
          emissiveMap={dayMode ? undefined : texture}
          emissive={dayMode ? new THREE.Color('#000000') : new THREE.Color('#ffffff')}
          emissiveIntensity={dayMode ? 0 : 0.4}
        />
      </mesh>
      {/* City markers - OUTSIDE the earth mesh so they're not blocked by it */}
      <CityMarkers
        spinning={spinning}
        spinSpeed={speedRef.current}
        onHover={onHover}
        onUnhover={onUnhover}
      />
    </group>
  );
}

/* ── Camera Rig - only active during resetCamera ── */
function CameraRig({ resetCamera }: { resetCamera: boolean }) {
  const { camera } = useThree();
  const idlePos = useMemo(() => new THREE.Vector3(0, 0.3, 5.5), []);

  useFrame(() => {
    if (resetCamera) {
      camera.position.lerp(idlePos, 0.06);
    }
  });

  return null;
}

/* ── Main Globe ── */
interface GlobeProps {
  spinning?: boolean;
  spinSpeed?: number;
  resetCamera?: boolean;
  dayMode?: boolean;
  onCityHover?: (city: City | null, pos: { x: number; y: number } | null) => void;
}

export default function Globe({
  spinning = false,
  spinSpeed = 0.003,
  resetCamera = false,
  dayMode = false,
  onCityHover,
}: GlobeProps) {
  const handleHover = useCallback((city: City, screenPos: { x: number; y: number }) => {
    onCityHover?.(city, screenPos);
  }, [onCityHover]);

  const handleUnhover = useCallback(() => {
    onCityHover?.(null, null);
  }, [onCityHover]);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.3, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        aria-label="Interactive Globe showing digital nomad destinations"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={dayMode ? 0.5 : 0.2} />
          <directionalLight position={[5, 3, 5]} intensity={dayMode ? 1.2 : 0.8} color="#ffffff" />
          <pointLight position={[-5, -3, -5]} intensity={dayMode ? 0.3 : 0.2} color="#4488ff" />
          <Earth
            spinning={spinning}
            spinSpeed={spinSpeed}
            dayMode={dayMode}
            onHover={handleHover}
            onUnhover={handleUnhover}
          />
          <AtmosphereGlow />
          <Stars radius={60} depth={60} count={3000} factor={3} saturation={0} fade speed={0.3} />
          <CameraRig resetCamera={resetCamera} />
          {!spinning && (
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              autoRotate={false}
              minDistance={3.5}
              maxDistance={8}
              minPolarAngle={0.1}
              maxPolarAngle={Math.PI - 0.1}
              rotateSpeed={0.5}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
