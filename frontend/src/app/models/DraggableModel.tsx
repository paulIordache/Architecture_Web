'use client';

import React, { useState, useEffect } from 'react';
import { useFrame, useThree, ThreeEvent, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { TextureLoader } from 'three';
import { ModelProps } from './Model';

interface DraggableModelProps extends ModelProps {
  setDragging: (dragging: boolean) => void;
  initialPosition: [number, number, number]; // Ensure initialPosition is defined here
}

const DraggableModel: React.FC<DraggableModelProps> = ({ objUrl, textureUrl, setDragging, initialPosition }) => {
  const obj = useLoader(OBJLoader, objUrl);
  const texture = useLoader(TextureLoader, textureUrl);

  // Apply texture to the model
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
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);
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

  // Update position of draggable objects while dragging
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
      // Ensure the draggable object can move while the room stays at [0, 0, 0]
      <primitive
          object={obj}
          position={position}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
      />
  );
};

export default DraggableModel;
