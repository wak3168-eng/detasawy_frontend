"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DIASPORA_LINKS, REGIONS } from "@/lib/regions";
import { PALETTE } from "@/lib/theme";

const RADIUS = 1;
const FOCUS_LON = 70;
const TILT_X = THREE.MathUtils.degToRad(30);

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = THREE.MathUtils.degToRad(lat);
  const lambda = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.sin(lambda),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(lambda),
  );
}

function Markers() {
  const rings = useRef<Array<THREE.Mesh | null>>([]);
  const { positions, quaternions } = useMemo(() => {
    const positions = REGIONS.map((r) =>
      latLonToVec3(r.lat, r.lon, RADIUS + 0.004),
    );
    const out = new THREE.Vector3(0, 0, 1);
    const quaternions = positions.map((p) =>
      new THREE.Quaternion().setFromUnitVectors(out, p.clone().normalize()),
    );
    return { positions, quaternions };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = (t * 0.4 + i * 0.37) % 1;
      ring.scale.setScalar(0.6 + phase * 2.2);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.5;
    });
  });

  return (
    <group>
      {REGIONS.map((region, i) => (
        <group key={region.name} position={positions[i]}>
          <mesh>
            <sphereGeometry args={[region.diaspora ? 0.011 : 0.016, 12, 12]} />
            <meshBasicMaterial
              color={region.diaspora ? PALETTE.sky : PALETTE.azureDeep}
            />
          </mesh>
          <mesh
            quaternion={quaternions[i]}
            ref={(el) => {
              rings.current[i] = el;
            }}
          >
            <ringGeometry args={[0.02, 0.028, 24]} />
            <meshBasicMaterial
              color={PALETTE.azure}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Arcs() {
  const geometries = useMemo(
    () =>
      DIASPORA_LINKS.map(([from, to]) => {
        const start = latLonToVec3(from.lat, from.lon, RADIUS + 0.002);
        const end = latLonToVec3(to.lat, to.lon, RADIUS + 0.002);
        const lift = 0.16 + start.distanceTo(end) * 0.22;
        const mid = start
          .clone()
          .add(end)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(RADIUS + lift);
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        return new THREE.TubeGeometry(curve, 40, 0.0035, 6);
      }),
    [],
  );

  return (
    <group>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshBasicMaterial
            color={PALETTE.azure}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const group = useRef<THREE.Group>(null);
  const baseY = -THREE.MathUtils.degToRad(FOCUS_LON);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = baseY + Math.sin(clock.getElapsedTime() * 0.12) * 0.22;
  });

  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 2, 4]} intensity={0.5} />
      <group ref={group} rotation={[TILT_X, baseY, 0]}>
        <mesh>
          <sphereGeometry args={[RADIUS, 48, 32]} />
          <meshStandardMaterial color="#f0f7fb" roughness={0.9} />
        </mesh>
        <mesh>
          <sphereGeometry args={[RADIUS * 1.001, 36, 24]} />
          <meshBasicMaterial
            color={PALETTE.sky}
            wireframe
            transparent
            opacity={0.22}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[RADIUS * 1.14, 32, 24]} />
          <meshBasicMaterial
            color={PALETTE.azure}
            transparent
            opacity={0.06}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
        <Markers />
        <Arcs />
      </group>
    </>
  );
}

export default function Globe() {
  return (
    <div className="h-full w-full" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 2.9], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
