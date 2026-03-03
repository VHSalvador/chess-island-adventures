import React from 'react';

interface PlacedItem3DProps {
  itemType: string;
  itemName: string;
  position: [number, number, number];
}

const TreeItem: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.35, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.08, 0.7, 6]} />
      <meshStandardMaterial color="#7a5230" roughness={1} flatShading />
    </mesh>
    <mesh position={[0, 0.85, 0]} castShadow>
      <coneGeometry args={[0.35, 0.6, 6]} />
      <meshStandardMaterial color="#3d8c32" roughness={0.85} flatShading />
    </mesh>
    <mesh position={[0, 1.15, 0]} castShadow>
      <coneGeometry args={[0.25, 0.4, 6]} />
      <meshStandardMaterial color="#4ca840" roughness={0.85} flatShading />
    </mesh>
  </group>
);

const HouseItem: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.3, 0]} castShadow>
      <boxGeometry args={[0.5, 0.6, 0.5]} />
      <meshStandardMaterial color="#e8c88a" roughness={0.8} flatShading />
    </mesh>
    {/* Roof */}
    <mesh position={[0, 0.75, 0]} castShadow>
      <coneGeometry args={[0.45, 0.4, 4]} />
      <meshStandardMaterial color="#c44" roughness={0.7} flatShading />
    </mesh>
    {/* Door */}
    <mesh position={[0, 0.15, 0.26]}>
      <boxGeometry args={[0.12, 0.2, 0.02]} />
      <meshStandardMaterial color="#6b4226" roughness={0.9} />
    </mesh>
  </group>
);

const FlowerItem: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
      <meshStandardMaterial color="#3a7a2a" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.35, 0]} castShadow>
      <sphereGeometry args={[0.1, 8, 6]} />
      <meshStandardMaterial color="#ff6b9d" roughness={0.6} flatShading />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.1, 0.35, Math.sin(a) * 0.1]} castShadow>
          <sphereGeometry args={[0.06, 6, 4]} />
          <meshStandardMaterial color="#ff9ecc" roughness={0.6} flatShading />
        </mesh>
      );
    })}
  </group>
);

const StoneItem: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.1, 0]} castShadow>
      <sphereGeometry args={[0.18, 6, 4]} />
      <meshStandardMaterial color="#999" roughness={0.9} flatShading />
    </mesh>
    <mesh position={[0.15, 0.08, 0.05]} castShadow>
      <sphereGeometry args={[0.12, 6, 4]} />
      <meshStandardMaterial color="#aaa" roughness={0.9} flatShading />
    </mesh>
  </group>
);

const ITEM_MAP: Record<string, React.FC<{ position: [number, number, number] }>> = {
  tree: TreeItem,
  nature: TreeItem,
  building: HouseItem,
  structure: HouseItem,
  flower: FlowerItem,
  decoration: StoneItem,
};

const PlacedItem3D: React.FC<PlacedItem3DProps> = ({ itemType, itemName, position }) => {
  const Component = ITEM_MAP[itemType] || StoneItem;
  return <Component position={position} />;
};

export default PlacedItem3D;
