'use client';

import React, { useState } from 'react';
import { useFrame, useThree, ThreeEvent, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { TextureLoader } from 'three';

interface DraggableModelProps {
  objUrl: string;
  textureUrl: string;
  setDragging: (dragging: boolean) => void;
}

const DraggableModel: React.FC<DraggableModelProps> = ({ objUrl, textureUrl, setDragging }) => {
  // Load OBJ and texture using react-three/fiber's useLoader hook
  const obj = useLoader(OBJLoader, objUrl);
  const texture = useLoader(TextureLoader, textureUrl);

  // Traverse the loaded object and apply the texture
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

  // States for dragging and position tracking
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState([0, 0, 0]);
  const { camera, raycaster, mouse } = useThree();

  // Handle pointer down (start dragging)
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);
    setDragging(true); // Disable OrbitControls when dragging
  };

  // Handle pointer up (stop dragging)
  const handlePointerUp = () => {
    setIsDragging(false);
    setDragging(false); // Re-enable OrbitControls after dragging stops
  };

  // Update model position while dragging
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

export default DraggableModel;