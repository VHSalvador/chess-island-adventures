import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

interface PathRoadProps {
  from: [number, number, number];
  to: [number, number, number];
  locked?: boolean;
}

const PathRoad: React.FC<PathRoadProps> = ({ from, to, locked }) => {
  const points = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.y += 0.2;
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x);
    mid.add(perp.multiplyScalar(0.5));

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(20).map(p => [p.x, p.y, p.z] as [number, number, number]);
  }, [from, to]);

  return (
    <Line
      points={points}
      color={locked ? '#999' : '#c9a86c'}
      lineWidth={3}
      transparent
      opacity={locked ? 0.2 : 0.7}
    />
  );
};

export default PathRoad;
