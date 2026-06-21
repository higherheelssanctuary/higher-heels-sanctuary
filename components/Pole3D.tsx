"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

function ChromePole() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (Math.PI * 2) / 20;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.04, 5.5, 32]} />
      <meshStandardMaterial
        color="#c8c8c8"
        metalness={0.92}
        roughness={0.12}
        envMapIntensity={2.5}
      />
    </mesh>
  );
}

function FloorNeonRing() {
  const meshRef = useRef<THREE.Mesh>(null);
  const emissiveRef = useRef(1.5);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    emissiveRef.current += delta * 1.5 * (emissiveRef.current > 2.5 ? -1 : emissiveRef.current < 1.5 ? 1 : 1);
    emissiveRef.current = Math.max(1.5, Math.min(2.5, emissiveRef.current));
    mat.emissiveIntensity = emissiveRef.current;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.75, 0]}>
      <torusGeometry args={[0.7, 0.025, 16, 80]} />
      <meshStandardMaterial
        color="#FF1E3C"
        emissive="#FF1E3C"
        emissiveIntensity={1.5}
        metalness={0.3}
        roughness={0.2}
      />
    </mesh>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.76, 0]}>
      <planeGeometry args={[8, 8]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={512}
        mixBlur={0.8}
        mixStrength={20}
        roughness={1}
        depthScale={1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0A0A0A"
        metalness={0.8}
        mirror={0}
      />
    </mesh>
  );
}

interface Pole3DProps {
  isMobile?: boolean;
  reducedMotion?: boolean;
}

export default function Pole3D({ isMobile = false, reducedMotion = false }: Pole3DProps) {
  if (reducedMotion) return null;

  return (
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0.5, 4], fov: 45 }}
      gl={{ antialias: !isMobile, alpha: true }}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight
        position={[0, -2, 0]}
        color="#FF1E3C"
        intensity={isMobile ? 15 : 25}
        distance={6}
        decay={2}
      />
      <pointLight
        position={[2, 3, -2]}
        color="#d0e0ff"
        intensity={isMobile ? 8 : 14}
        distance={8}
        decay={2}
      />
      <pointLight
        position={[-1, 2, 2]}
        color="#ffffff"
        intensity={isMobile ? 5 : 8}
        distance={6}
        decay={2}
      />

      <Environment preset="night" />

      {!reducedMotion && (
        <>
          <ChromePole />
          <FloorNeonRing />
          <Floor />
        </>
      )}
    </Canvas>
  );
}
