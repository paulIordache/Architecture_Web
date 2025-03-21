'use client';

import React, { useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';


// Draggable Model Component
const Model = ({
  objUrl,
  textureUrl,
  setDragging,
}: {
  objUrl: string;
  textureUrl: string;
  setDragging: (dragging: boolean) => void;
}) => {
  const obj = useLoader(OBJLoader, objUrl);
  const texture = useLoader(TextureLoader, textureUrl);

  // Apply the texture
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => {
          (material as THREE.MeshStandardMaterial).map = texture;
        });
      } else {
        (mesh.material as THREE.MeshStandardMaterial).map = texture;
      }
    }
  });

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState([0, 0, 0]);
  const { camera, raycaster, mouse } = useThree();

  // Handle pointer down (start dragging)
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);
    setDragging(true); // Disable OrbitControls
  };

  // Handle pointer up (stop dragging)
  const handlePointerUp = () => {
    setIsDragging(false);
    setDragging(false); // Re-enable OrbitControls
  };

  // Handle dragging
  useFrame(() => {
    if (isDragging) {
      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        setPosition([intersection.x, intersection.y, position[2]]);
      }
    }
  });

  return (
    <primitive
      object={obj}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    />
  );
};

// Main Component
const ThreePage: React.FC = () => {
  const objUrl = 'http://localhost:8080/assets/Chair.obj';
  const textureUrl = 'http://localhost:8080/assets/chair.png';

  const [dragging, setDragging] = useState(false);

  return (
    <div className="h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Model objUrl={objUrl} textureUrl={textureUrl} setDragging={setDragging} />
        <OrbitControls enabled={!dragging} /> {/* Disable controls while dragging */}
      </Canvas>
    </div>
  );
};

export default ThreePage;
