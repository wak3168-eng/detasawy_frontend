import * as THREE from "three";

export function latLonToVec3(
  lat: number,
  lon: number,
  radius: number,
): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(lat);
  const lambda = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.sin(lambda),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(lambda),
  );
}
