import { useRef, useMemo, useCallback, Suspense, useState, useEffect } from 'react';
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

/** Convert longitude to an initial Y-rotation so that location faces camera */
function lngToYRotation(lng: number): number {
  // Camera looks at -Z by default, so we rotate the globe to place the longitude in front
  return -((lng + 90) * Math.PI) / 180;
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
  const glowRef = useRef<THREE.Mesh>(null!);
  const timeRef = useRef(0);
  const hoveredRef = useRef<number | null>(null);
  const { camera } = useThree();
  // Track camera distance for inverse-scale of dots
  const camDistRef = useRef(5.5);

  const defaultColor = useMemo(() => new THREE.Color('#00ffaa'), []);
  const hoverColor = useMemo(() => new THREE.Color('#ffdd44'), []);

  const positions = useMemo(() => {
    return cities.map(city => latLngToVec3(city.lat, city.lng, 2.06));
  }, []);

  const count = positions.length;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const colorArray = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      defaultColor.toArray(arr, i * 3);
    }
    return arr;
  }, [count, defaultColor]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;
    const stretch = spinning ? 1 + spinSpeed * 4 : 1;
    const hovered = hoveredRef.current;

    // Inverse-scale: dots shrink as you zoom in so they don't crowd
    camDistRef.current = camera.position.length();
    const zoomFactor = Math.max(0.3, Math.min(1.0, (camDistRef.current - 3.5) / 4.0));

    for (let i = 0; i < count; i++) {
      const p = positions[i];
      dummy.position.copy(p);
      const isHovered = hovered === i;
      const baseSize = (isHovered ? 0.06 : 0.028) * zoomFactor;
      const pulse = baseSize + Math.sin(t * 2 + i * 0.5) * 0.006 * zoomFactor;
      dummy.scale.set(pulse * stretch, pulse, pulse);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      tempColor.copy(isHovered ? hoverColor : defaultColor);
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    if (glowRef.current) {
      if (hovered !== null) {
        glowRef.current.visible = true;
        glowRef.current.position.copy(positions[hovered]);
        const glowPulse = 0.12 + Math.sin(t * 3) * 0.03;
        glowRef.current.scale.setScalar(glowPulse);
        glowRef.current.lookAt(0, 0, 0);
      } else {
        glowRef.current.visible = false;
      }
    }
  });

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
    <>
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
        <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
      </instancedMesh>
      <mesh ref={glowRef} visible={false}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ffdd44"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* ── Earth with texture ── */
function Earth({
  spinning,
  spinSpeed,
  dayMode,
  autoSpin,
  userDragging,
  initialRotationY,
  focusCity,
  onHover,
  onUnhover,
}: {
  spinning: boolean;
  spinSpeed: number;
  dayMode: boolean;
  autoSpin: boolean;
  userDragging: boolean;
  initialRotationY: number;
  focusCity?: City | null;
  onHover: (city: City, screenPos: { x: number; y: number }) => void;
  onUnhover: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const speedRef = useRef(0);
  const initializedRef = useRef(false);

  const nightTexture = useLoader(THREE.TextureLoader, '/textures/earth-night.jpg');
  const dayTexture = useLoader(THREE.TextureLoader, '/textures/earth-day.jpg');

  useMemo(() => {
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.anisotropy = 4;
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    dayTexture.anisotropy = 4;
  }, [nightTexture, dayTexture]);

  const texture = dayMode ? dayTexture : nightTexture;

  // Set initial rotation from geolocation
  useEffect(() => {
    if (!initializedRef.current && groupRef.current) {
      groupRef.current.rotation.y = initialRotationY;
      initializedRef.current = true;
    }
  }, [initialRotationY]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // When focusCity is set, smoothly rotate to center that city
    if (focusCity && !spinning) {
      const targetRotY = lngToYRotation(focusCity.lng);
      // Normalize rotation to avoid spinning the long way around
      const current = groupRef.current.rotation.y;
      const diff = targetRotY - current;
      const normalizedDiff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      groupRef.current.rotation.y += normalizedDiff * 0.04;
      speedRef.current = 0;
      return;
    }

    // Rotation logic:
    // - During casino spin animation: use spinSpeed
    // - autoSpin ON + not dragging: idle speed 0.003
    // - autoSpin ON + dragging: 0 (pause)
    // - autoSpin OFF: always 0 (fully manual)
    let target: number;
    if (spinning) {
      target = spinSpeed;
    } else if (autoSpin && !userDragging) {
      target = 0.003;
    } else {
      target = 0;
    }

    speedRef.current = THREE.MathUtils.lerp(
      speedRef.current,
      target,
      spinning ? 0.03 : 0.08
    );
    groupRef.current.rotation.y += speedRef.current * delta * 60;
  });

  return (
    <group ref={groupRef}>
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
      <CityMarkers
        spinning={spinning}
        spinSpeed={speedRef.current}
        onHover={onHover}
        onUnhover={onUnhover}
      />
    </group>
  );
}

/* ── Camera Rig - handles resetCamera & focusCity zoom ── */
function CameraRig({ resetCamera, focusCity }: { resetCamera: boolean; focusCity?: City | null }) {
  const { camera } = useThree();
  const idlePos = useMemo(() => new THREE.Vector3(0, 0.3, 5.5), []);

  useFrame(() => {
    if (resetCamera) {
      camera.position.lerp(idlePos, 0.06);
    } else if (focusCity) {
      const latOffset = (focusCity.lat / 90) * 0.5;
      const focusPos = new THREE.Vector3(0, 0.3 + latOffset, 4.2);
      camera.position.lerp(focusPos, 0.04);
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
  autoSpin?: boolean;
  focusCity?: City | null;
  onAutoSpinOff?: () => void;
  onCityHover?: (city: City | null, pos: { x: number; y: number } | null) => void;
}

export default function Globe({
  spinning = false,
  spinSpeed = 0.003,
  resetCamera = false,
  dayMode = true,
  autoSpin = false,
  focusCity = null,
  onAutoSpinOff,
  onCityHover,
}: GlobeProps) {
  const [userDragging, setUserDragging] = useState(false);
  const [initialRotationY, setInitialRotationY] = useState(0);

  // Request geolocation on mount to set initial globe orientation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setInitialRotationY(lngToYRotation(pos.coords.longitude));
        },
        () => {},
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
  }, []);

  const handleDragStart = useCallback(() => {
    setUserDragging(true);
    if (autoSpin && onAutoSpinOff) {
      onAutoSpinOff();
    }
  }, [autoSpin, onAutoSpinOff]);

  const handleDragEnd = useCallback(() => {
    setUserDragging(false);
  }, []);

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
            autoSpin={autoSpin}
            userDragging={userDragging}
            initialRotationY={initialRotationY}
            focusCity={focusCity}
            onHover={handleHover}
            onUnhover={handleUnhover}
          />
          <AtmosphereGlow />
          <Stars radius={60} depth={60} count={3000} factor={3} saturation={0} fade speed={0.3} />
          <CameraRig resetCamera={resetCamera} focusCity={focusCity} />
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
              onStart={handleDragStart}
              onEnd={handleDragEnd}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
