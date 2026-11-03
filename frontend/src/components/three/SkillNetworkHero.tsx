import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const NetworkNodes: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  // 6 skill nodes in 3D space
  const nodes = [
    { pos: [0, 0, 0] as [number, number, number], color: '#10b981', size: 0.5 },
    { pos: [1.8, 0.8, -0.5] as [number, number, number], color: '#14b8a6', size: 0.35 },
    { pos: [-1.6, 0.6, 0.6] as [number, number, number], color: '#06b6d4', size: 0.3 },
    { pos: [0.8, -1.2, 0.8] as [number, number, number], color: '#10b981', size: 0.38 },
    { pos: [-1.2, -0.9, -0.7] as [number, number, number], color: '#3b82f6', size: 0.32 },
    { pos: [0.2, 1.5, 0.4] as [number, number, number], color: '#059669', size: 0.28 },
  ];

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1.5}>
          <Sphere position={node.pos} args={[node.size, 32, 32]}>
            <MeshDistortMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.2}
              distort={0.25}
              speed={1.5}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
};

export const SkillNetworkHero: React.FC = () => {
  return (
    <div className="w-full h-64 sm:h-80 md:h-96 relative flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} color="#10b981" intensity={0.5} />
        <NetworkNodes />
      </Canvas>
    </div>
  );
};

export default SkillNetworkHero;
