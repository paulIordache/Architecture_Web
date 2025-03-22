// Model.tsx
import React, { useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'; // OBJLoader for loading .obj files
import { TextureLoader } from 'three'; // TextureLoader for loading textures
import * as THREE from 'three';

type ModelProps = {
  objUrl: string;      // URL to the .obj file
  textureUrl: string;  // URL to the texture image
  setDragging: (dragging: boolean) => void; // Function to enable/disable dragging
};

const Model: React.FC<ModelProps> = ({ objUrl, textureUrl, setDragging }) => {
  const obj = useLoader(OBJLoader, objUrl);  // Load the .obj file
  const texture = useLoader(TextureLoader, textureUrl);  // Load the texture image

  // Apply the texture to the object
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

  // State for dragging
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState([0, 0, 0]);

  // Handle pointer down (start dragging)
  const handlePointerDown = (event: React.PointerEvent) => {
    event.stopPropagation();
    setIsDragging(true);
    setDragging(true);  // Disable OrbitControls while dragging
  };

  // Handle pointer up (stop dragging)
  const handlePointerUp = () => {
    setIsDragging(false);
    setDragging(false);  // Re-enable OrbitControls
  };

  return (
    <primitive
      object={obj}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    />
  );
};

export default Model;
