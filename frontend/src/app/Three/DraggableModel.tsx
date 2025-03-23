'use client';

import React, { useState, useRef } from 'react';
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
  // Load OBJ and texture
  const obj = useLoader(OBJLoader, objUrl);
  const texture = useLoader(TextureLoader, textureUrl);

  // Traverse and apply texture
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

  // Dragging state and position tracking
  const isDragging = useRef(false);
  const position = useRef(new THREE.Vector3(0, 0, 0));
  const { camera, raycaster, mouse } = useThree();

  // Pointer down (start dragging)
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    isDragging.current = true;
    setDragging(true);
  };

  // Pointer up (stop dragging)
  const handlePointerUp = () => {
    isDragging.current = false;
    setDragging(false);
  };

  // Pointer move (update position)
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (isDragging.current) {
      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.current.y);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        position.current.set(intersection.x, position.current.y, intersection.z);
      }
    }
  };

  // Sync position with rendering
  useFrame(() => {
    obj.position.copy(position.current);
  });

  return (
    <primitive
      object={obj}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    />
  );
};

export default DraggableModel;