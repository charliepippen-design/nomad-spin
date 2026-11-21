import { useRef, useMemo, useCallback, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
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

/** How a city was reached: the mouse resting near it, or a click / tap on it. */
export type CityPickKind = 'hover' | 'tap';
export type CityPickHandler = (city: City | null, screenPos: { x: number; y: number } | null, kind: CityPickKind) => void;

/** Pixels around a marker that still count as "on it". Markers are a few pixels wide, fingers are not. */
const PICK_RADIUS_MOUSE = 22;
const PICK_RADIUS_TOUCH = 40;
/** Once a marker is hovered it keeps the hover out to this distance, so a shaky hand does not drop it. */
const HOLD_RADIUS_MOUSE = 38;
/** A press that travels further than this is a drag, not a tap. */
const TAP_SLOP = 8;

const CITY_INDEX = new Map(cities.map((city, index) => [city.id, index]));

/* ── City markers. Picking is by screen distance to the nearest marker, not by hitting its mesh. ── */
function CityMarkers({
  spinning,
  spinSpeed,
  activeCityId,
  onPick,
}: {
  spinning: boolean;
  spinSpeed: number;
  activeCityId: string | null;
  onPick: CityPickHandler;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const timeRef = useRef(0);
  const hoveredRef = useRef<number | null>(null);
  const { camera, gl } = useThree();
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
        const glowPulse = (0.12 + Math.sin(t * 3) * 0.03) * zoomFactor;
        glowRef.current.scale.setScalar(glowPulse);
        glowRef.current.lookAt(0, 0, 0);
      } else {
        glowRef.current.visible = false;
      }
    }
  });

  // The highlighted marker is whatever the page says is active.
  useEffect(() => {
    hoveredRef.current = activeCityId ? CITY_INDEX.get(activeCityId) ?? null : null;
  }, [activeCityId]);

  useEffect(() => {
    const el = gl.domElement;
    const v = new THREE.Vector3();

    /** Nearest marker on the visible side of the globe within `radius` pixels, with its screen position. */
    const pick = (clientX: number, clientY: number, radius: number) => {
      const mesh = meshRef.current;
      if (!mesh) return null;
      mesh.updateWorldMatrix(true, false);
      const rect = el.getBoundingClientRect();
      let best = -1;
      let bestDist = radius * radius;
      let bestX = 0;
      let bestY = 0;
      for (let i = 0; i < count; i++) {
        v.copy(positions[i]).applyMatrix4(mesh.matrixWorld);
        // Behind the horizon as seen from the camera: not pickable.
        if (v.dot(camera.position) < v.lengthSq()) continue;
        v.project(camera);
        const x = rect.left + ((v.x + 1) / 2) * rect.width;
        const y = rect.top + ((1 - v.y) / 2) * rect.height;
        const dist = (x - clientX) ** 2 + (y - clientY) ** 2;
        if (dist < bestDist) {
          best = i;
          bestDist = dist;
          bestX = x;
          bestY = y;
        }
      }
      return best < 0 ? null : { index: best, x: bestX, y: bestY };
    };

    let lastHover = -1;
    let frame = 0;
    const pointers = new Map<number, { x: number; y: number; moved: boolean }>();

    /** Screen distance from a point to one marker, or Infinity when it is behind the globe. */
    const distanceTo = (index: number, clientX: number, clientY: number) => {
      const mesh = meshRef.current;
      if (!mesh) return Infinity;
      mesh.updateWorldMatrix(true, false);
      v.copy(positions[index]).applyMatrix4(mesh.matrixWorld);
      if (v.dot(camera.position) < v.lengthSq()) return Infinity;
      v.project(camera);
      const rect = el.getBoundingClientRect();
      return Math.hypot(rect.left + ((v.x + 1) / 2) * rect.width - clientX, rect.top + ((1 - v.y) / 2) * rect.height - clientY);
    };

    const hover = (clientX: number, clientY: number) => {
      const hit = pick(clientX, clientY, PICK_RADIUS_MOUSE);
      // Hysteresis: leaving the pick radius by a few pixels keeps the current marker.
      if (!hit && lastHover >= 0 && distanceTo(lastHover, clientX, clientY) <= HOLD_RADIUS_MOUSE) return;
      const index = hit ? hit.index : -1;
      el.style.cursor = hit ? 'pointer' : '';
      if (index === lastHover) return;
      lastHover = index;
      // Anchor the card to the marker, not to the cursor, so it does not chase the mouse.
      if (hit) onPick(cities[hit.index], { x: hit.x, y: hit.y }, 'hover');
      else onPick(null, null, 'hover');
    };

    const onMove = (e: PointerEvent) => {
      const press = pointers.get(e.pointerId);
      if (press) {
        if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > TAP_SLOP) press.moved = true;
        return;
      }
      if (spinning || e.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => hover(e.clientX, e.clientY));
    };
    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, moved: false });
      // A second finger means pinch-zoom: none of these presses is a tap.
      if (pointers.size > 1) pointers.forEach((p) => (p.moved = true));
    };
    const onUp = (e: PointerEvent) => {
      const press = pointers.get(e.pointerId);
      pointers.delete(e.pointerId);
      if (!press || press.moved || spinning) return;
      const hit = pick(e.clientX, e.clientY, e.pointerType === 'mouse' ? PICK_RADIUS_MOUSE : PICK_RADIUS_TOUCH);
      lastHover = hit ? hit.index : -1;
      if (hit) onPick(cities[hit.index], { x: hit.x, y: hit.y }, 'tap');
      else onPick(null, null, 'tap');
    };
    const onCancel = (e: PointerEvent) => pointers.delete(e.pointerId);
    const onLeave = (e: PointerEvent) => {
      // A queued hover must not fire after the pointer has moved onto the card.
      cancelAnimationFrame(frame);
      if (e.pointerType !== 'mouse' || lastHover === -1) return;
      lastHover = -1;
      onPick(null, null, 'hover');
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.style.cursor = '';
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [gl, camera, positions, count, spinning, onPick]);

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
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
  activeCityId,
  onPick,
}: {
  spinning: boolean;
  spinSpeed: number;
  dayMode: boolean;
  autoSpin: boolean;
  userDragging: boolean;
  initialRotationY: number;
  focusCity?: City | null;
  activeCityId: string | null;
  onPick: CityPickHandler;
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
    } else if (autoSpin && !userDragging && !activeCityId) {
      // The globe holds still while a city card is open, so the marker stays under the pointer.
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
        activeCityId={activeCityId}
        onPick={onPick}
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
  /** City whose marker is highlighted. While set, auto-rotation pauses. */
  activeCityId?: string | null;
  /** Fired when the mouse rests near a marker or leaves it (hover), and on every click or tap (tap). */
  onCityPick?: CityPickHandler;
}

export default function Globe({
  spinning = false,
  spinSpeed = 0.003,
  resetCamera = false,
  dayMode = true,
  autoSpin = false,
  focusCity = null,
  onAutoSpinOff,
  activeCityId = null,
  onCityPick,
}: GlobeProps) {
  const [userDragging, setUserDragging] = useState(false);
  const [initialRotationY, setInitialRotationY] = useState(0);

  // Initialize globe orientation (disabled automatic geolocation request per user request)
  useEffect(() => {
    // We start at a neutral 0 rotation (facing Greenwich) 
    // or we could set a specific default here.
    setInitialRotationY(0);
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

  const handlePick = useCallback<CityPickHandler>(
    (city, screenPos, kind) => onCityPick?.(city, screenPos, kind),
    [onCityPick],
  );

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
            activeCityId={activeCityId}
            onPick={handlePick}
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
