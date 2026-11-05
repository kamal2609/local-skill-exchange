import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';

interface SkillNode {
  id: number;
  name: string;
  category: string;
  pos: [number, number, number];
  color: string;
  size: number;
}

const NODES: SkillNode[] = [
  { id: 1, name: 'Python Coding', category: 'Technology', pos: [0, 0, 0], color: '#10b981', size: 0.44 },
  { id: 2, name: 'Spanish Fluency', category: 'Language', pos: [1.8, 0.8, -0.5], color: '#14b8a6', size: 0.34 },
  { id: 3, name: 'Urban Gardening', category: 'Lifestyle', pos: [-1.6, 0.6, 0.6], color: '#06b6d4', size: 0.32 },
  { id: 4, name: 'Acoustic Guitar', category: 'Creative', pos: [0.8, -1.2, 0.8], color: '#3b82f6', size: 0.36 },
  { id: 5, name: 'UI / UX Design', category: 'Design', pos: [-1.2, -0.9, -0.7], color: '#8b5cf6', size: 0.32 },
  { id: 6, name: 'Sourdough Baking', category: 'Culinary', pos: [0.2, 1.5, 0.4], color: '#f59e0b', size: 0.3 },
];

// Network connection pairs linking barter-compatible skills
const CONNECTIONS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 3],
  [2, 4],
  [3, 4],
  [1, 5],
  [2, 5],
];

const NetworkLines: React.FC = () => {
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    CONNECTIONS.forEach(([fromIdx, toIdx]) => {
      points.push(new THREE.Vector3(...NODES[fromIdx].pos));
      points.push(new THREE.Vector3(...NODES[toIdx].pos));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial color="#10b981" transparent opacity={0.25} />
    </lineSegments>
  );
};

const NetworkNodes: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.08) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <NetworkLines />
      {NODES.map((node) => {
        const isHovered = hoveredId === node.id;
        return (
          <Float key={node.id} speed={2} rotationIntensity={1} floatIntensity={1.5}>
            <Sphere
              position={node.pos}
              args={[node.size * (isHovered ? 1.25 : 1), 32, 32]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(node.id);
              }}
              onPointerOut={() => setHoveredId(null)}
            >
              <MeshDistortMaterial
                color={isHovered ? '#34d399' : node.color}
                emissive={node.color}
                emissiveIntensity={isHovered ? 0.6 : 0.25}
                distort={isHovered ? 0.35 : 0.22}
                speed={isHovered ? 3 : 1.5}
                roughness={0.2}
                metalness={0.7}
              />
              {isHovered && (
                <Html center distanceFactor={7} pointerEvents="none">
                  <div className="bg-slate-900/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold shadow-xl whitespace-nowrap border border-emerald-500/30 flex items-center gap-1.5 animate-fadeIn">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{node.name}</span>
                    <span className="text-[10px] text-emerald-300 font-normal">({node.category})</span>
                  </div>
                </Html>
              )}
            </Sphere>
          </Float>
        );
      })}
    </group>
  );
};

// 2D SVG fallback constellation for mobile or environments without WebGL
const FallbackConstellation: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl">
    <svg className="w-full h-full max-w-md max-h-80" viewBox="0 0 400 300">
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Network Edges */}
      <line x1="200" y1="150" x2="300" y2="80" stroke="#10b981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="200" y1="150" x2="100" y2="90" stroke="#10b981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="200" y1="150" x2="260" y2="240" stroke="#10b981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="200" y1="150" x2="120" y2="220" stroke="#10b981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="200" y1="150" x2="210" y2="50" stroke="#10b981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="300" y1="80" x2="260" y2="240" stroke="#14b8a6" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="100" y1="90" x2="120" y2="220" stroke="#06b6d4" strokeOpacity="0.2" strokeWidth="1" />

      {/* Nodes */}
      <circle cx="200" cy="150" r="18" fill="url(#nodeGlow)" />
      <circle cx="200" cy="150" r="10" fill="#10b981" />
      <circle cx="300" cy="80" r="8" fill="#14b8a6" />
      <circle cx="100" cy="90" r="7" fill="#06b6d4" />
      <circle cx="260" cy="240" r="8" fill="#3b82f6" />
      <circle cx="120" cy="220" r="7" fill="#8b5cf6" />
      <circle cx="210" cy="50" r="6" fill="#f59e0b" />
    </svg>
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
      <span className="text-xs font-medium text-emerald-400 bg-slate-800/80 px-3 py-1 rounded-full border border-emerald-500/30">
        Interactive 3D Skill Network
      </span>
    </div>
  </div>
);

export const SkillNetworkHero: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-72 sm:h-80 md:h-96 relative flex items-center justify-center p-4">
        <FallbackConstellation />
      </div>
    );
  }

  return (
    <div className="w-full h-72 sm:h-80 md:h-96 relative flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 45 }}
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
