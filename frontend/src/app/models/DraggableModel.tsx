'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree, ThreeEvent, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { TextureLoader } from 'three';
import { ModelProps } from './Model';

interface DraggableModelProps extends ModelProps {
  setDragging: (dragging: boolean) => void;
  scale?: number | [number, number, number];
  initialPosition?: [number, number, number];
  initialRotation?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onPositionChange?: (position: [number, number, number], rotation: number) => void;
}

const DraggableModel: React.FC<DraggableModelProps> = ({
                                                         objUrl,
                                                         textureUrl,
                                                         setDragging,
                                                         scale = 1,
                                                         initialPosition = [0, 0, 0],
                                                         initialRotation = 0,
                                                         isSelected = false,
                                                         onClick,
                                                         onPositionChange,
                                                       }) => {
  const obj = useLoader(OBJLoader, objUrl);
  const texture = useLoader(TextureLoader, textureUrl);
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => {
            (material as THREE.MeshStandardMaterial).map = texture;
            (material as THREE.MeshStandardMaterial).needsUpdate = true;
          });
        } else {
          (mesh.material as THREE.MeshStandardMaterial).map = texture;
          (mesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
        }
      }
    });
  }, [obj, texture]);

  useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material) => {
            if ((material as THREE.MeshStandardMaterial).emissive) {
              if (isSelected) {
                if (!child.userData.originalEmissive) {
                  child.userData.originalEmissive = (material as THREE.MeshStandardMaterial).emissive.clone();
                }
                (material as THREE.MeshStandardMaterial).emissive.set(0x333333);
              } else if (child.userData.originalEmissive) {
                (material as THREE.MeshStandardMaterial).emissive.copy(child.userData.originalEmissive);
              }
            }
          });
        }
      });
    }
  }, [obj, isSelected]);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);
  const [rotation, setRotation] = useState<number>(initialRotation);
  const { camera, raycaster, mouse, gl } = useThree();

  useEffect(() => {
    setPosition(initialPosition);
    setRotation(initialRotation);
  }, [initialPosition, initialRotation]);

  const pointerIdRef = useRef<number | null>(null);
  const startPositionRef = useRef<[number, number, number]>([0, 0, 0]);
  const clickStartTimeRef = useRef<number>(0);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    clickStartTimeRef.current = Date.now();
    startPositionRef.current = [...position];
    pointerIdRef.current = event.pointerId;
    gl.domElement.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setDragging(true);
    event.stopPropagation();
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (pointerIdRef.current === event.pointerId) {
      gl.domElement.releasePointerCapture(event.pointerId);
      pointerIdRef.current = null;
      setIsDragging(false);
      setDragging(false);

      const isClick = Date.now() - clickStartTimeRef.current < 200 &&
          position[0] === startPositionRef.current[0] &&
          position[1] === startPositionRef.current[1] &&
          position[2] === startPositionRef.current[2];

      if (isClick && onClick) {
        onClick();
      }

      if (!isClick && onPositionChange) {
        onPositionChange(position, rotation);
      }
    }
    event.stopPropagation();
  };

  const handlePointerMissed = () => {
    if (isDragging && pointerIdRef.current !== null) {
      try {
        gl.domElement.releasePointerCapture(pointerIdRef.current);
      } catch (e) {}
      pointerIdRef.current = null;
      setIsDragging(false);
      setDragging(false);
      if (onPositionChange) {
        onPositionChange(position, rotation);
      }
    }
  };

  useFrame(() => {
    if (isDragging) {
      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position[1]);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        const newPosition: [number, number, number] = [
          intersection.x,
          position[1],
          intersection.z,
        ];
        setPosition(newPosition);
      }
    }
  });

  const scaleValue = Array.isArray(scale) ? scale : [scale, scale, scale];

  return (
      <group
          ref={modelRef}
          position={position}
          rotation={[0, rotation, 0]}
          scale={scaleValue}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMissed={handlePointerMissed}
      >
        <primitive object={obj.clone()} />
        {isSelected && (
            <mesh scale={[1.1, 1.1, 1.1]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="yellow" wireframe transparent opacity={0.3} />
            </mesh>
        )}
      </group>
  );
};

export default DraggableModel;