import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import { Mesh, Vector3, MeshStandardMaterial } from 'three';
import * as THREE from 'three';
import { useDrag } from '@use-gesture/react';

interface DraggableModelProps {
  objUrl: string;
  textureUrl?: string;
  initialPosition?: [number, number, number];
  scale?: [number, number, number];
  setDragging: (isDragging: boolean) => void;
  onPositionChange?: (position: [number, number, number]) => void;
  isSelected?: boolean;
  onClick?: () => void;
}

const DraggableModel: React.FC<DraggableModelProps> = ({
                                                         objUrl,
                                                         textureUrl,
                                                         initialPosition = [0, 0, 0],
                                                         scale = [1, 1, 1],
                                                         setDragging,
                                                         onPositionChange,
                                                         isSelected = false,
                                                         onClick
                                                       }) => {
  const obj = useLoader(OBJLoader, objUrl);
  const texture = textureUrl ? useLoader(TextureLoader, textureUrl) : null;
  const modelRef = useRef<THREE.Group>(null);
  const { size, viewport, camera, scene } = useThree();
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);
  const aspect = size.width / viewport.width;
  const [isDragging, setIsDragging] = useState(false);

  // Apply texture to materials if available
  useEffect(() => {
    if (obj && texture) {
      obj.traverse((child) => {
        if (child instanceof Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];

          materials.forEach(material => {
            if (material instanceof MeshStandardMaterial) {
              material.map = texture;
              material.needsUpdate = true;
            }
          });
        }
      });
    }
  }, [obj, texture]);

  // Update position when initialPosition changes
  useEffect(() => {
    if (modelRef.current) {
      setPosition(initialPosition);
      modelRef.current.position.set(initialPosition[0], initialPosition[1], initialPosition[2]);
    }
  }, [initialPosition]);

  // Apply highlight effect when selected
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];

          materials.forEach(material => {
            if (material instanceof MeshStandardMaterial) {
              if (isSelected) {
                // Store original emissive if not already stored
                if (!child.userData.originalEmissive) {
                  child.userData.originalEmissive = material.emissive.clone();
                }
                material.emissive.set(0x333333);
              } else if (child.userData.originalEmissive) {
                material.emissive.copy(child.userData.originalEmissive);
              }
            }
          });
        }
      });
    }
  }, [isSelected]);

  // Plane for dragging
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const dragPoint = new THREE.Vector3();

  // Use gesture for dragging
  const bind = useDrag(
      ({ active, movement: [x, y], first, last, event }) => {
        if (first) {
          setDragging(true);
          setIsDragging(true);
        }

        if (last) {
          setDragging(false);
          setIsDragging(false);

          // Notify parent about position change when drag ends
          if (onPositionChange) {
            onPositionChange(position);
          }
        }

        if (active && modelRef.current) {
          // Calculate intersection with the drag plane
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2(
              (event.clientX / size.width) * 2 - 1,
              -(event.clientY / size.height) * 2 + 1
          );

          raycaster.setFromCamera(mouse, camera);

          if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
            // Update position based on the drag point
            const newPosition: [number, number, number] = [
              dragPoint.x,
              position[1], // Keep Y position the same
              dragPoint.z
            ];

            setPosition(newPosition);
            modelRef.current.position.set(newPosition[0], newPosition[1], newPosition[2]);
          } else {
            // Fallback to simple movement if plane intersection fails
            const movementX = x / aspect * 0.02;
            const movementZ = y / aspect * 0.02;

            const newPosition: [number, number, number] = [
              position[0] + movementX,
              position[1],
              position[2] + movementZ
            ];

            setPosition(newPosition);
            modelRef.current.position.set(newPosition[0], newPosition[1], newPosition[2]);
          }
        }
      },
      { preventDefault: true }
  );

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
      <group
          ref={modelRef}
          position={new Vector3(...position)}
          scale={scale}
          {...bind()}
          onClick={handleClick}
          userData={{ draggable: true }}
      >
        <primitive object={obj.clone()} />

        {isSelected && (
            <mesh scale={[1.2, 1.2, 1.2]} visible={true}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="yellow" wireframe={true} transparent opacity={0.3} />
            </mesh>
        )}
      </group>
  );
};

export default DraggableModel;