import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import { Mesh, Vector3, MeshStandardMaterial, Raycaster, Plane } from 'three';
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
  const texture = useLoader(TextureLoader, textureUrl || '/placeholder-texture.jpg');
  const modelRef = useRef<THREE.Group>(null);
  const { size, viewport, camera } = useThree();
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);
  const aspect = size.width / viewport.width;

  useEffect(() => {
    if (obj && textureUrl) {
      obj.traverse((child) => {
        if (child instanceof Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if (material instanceof MeshStandardMaterial) {
              material.map = texture;
              material.needsUpdate = true;
            }
          });
        }
      });
    }
  }, [obj, texture, textureUrl]);

  useEffect(() => {
    if (modelRef.current) {
      setPosition(initialPosition);
      modelRef.current.position.set(...initialPosition);
    }
  }, [initialPosition]);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if (material instanceof MeshStandardMaterial) {
              if (isSelected) {
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

  const dragPlane = new Plane(new Vector3(0, 1, 0), 0);
  const dragPoint = new Vector3();

  const bind = useDrag(
      ({ active, movement: [x, y], first, last, event }) => {
        if (first) setDragging(true);
        if (last) {
          setDragging(false);
          if (onPositionChange && modelRef.current) {
            onPositionChange([
              modelRef.current.position.x,
              modelRef.current.position.y,
              modelRef.current.position.z
            ]);
          }
        }

        if (active && modelRef.current) {
          const raycaster = new Raycaster();

          // Fallback safe client coordinates
          let clientX = 0;
          let clientY = 0;

          if ('touches' in event && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
          } else if ('clientX' in event && 'clientY' in event) {
            clientX = event.clientX;
            clientY = event.clientY;
          }

          const mouse = new THREE.Vector2(
              (clientX / size.width) * 2 - 1,
              -(clientY / size.height) * 2 + 1
          );

          raycaster.setFromCamera(mouse, camera);

          if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
            const newPosition: [number, number, number] = [
              dragPoint.x,
              position[1],
              dragPoint.z
            ];
            setPosition(newPosition);
            modelRef.current.position.set(...newPosition);
          } else {
            const movementX = x / aspect * 0.02;
            const movementZ = y / aspect * 0.02;

            const newPosition: [number, number, number] = [
              position[0] + movementX,
              position[1],
              position[2] + movementZ
            ];

            setPosition(newPosition);
            modelRef.current.position.set(...newPosition);
          }
        }
      },
      {
        // ✅ Removed preventDefault to avoid errors
      }
  );

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.();
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
            <mesh scale={[1.2, 1.2, 1.2]} visible>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="yellow" wireframe transparent opacity={0.3} />
            </mesh>
        )}
      </group>
  );
};

export default DraggableModel;
