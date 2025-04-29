import React, { useEffect, useRef, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface DraggableModelProps {
  objUrl: string;
  textureUrl?: string;
  setDragging: (dragging: boolean) => void;
  initialPosition: [number, number, number];
  scale?: [number, number, number];
  onPositionChange: (position: [number, number, number]) => void;  // Add the onPositionChange prop
}

const DraggableModel: React.FC<DraggableModelProps> = ({
                                                         objUrl,
                                                         textureUrl,
                                                         setDragging,
                                                         initialPosition,
                                                         scale = [1, 1, 1],
                                                         onPositionChange, // Destructure the new prop
                                                       }) => {
  const obj = useLoader(OBJLoader, objUrl);
  const meshRef = useRef<THREE.Group>(null);
  const { camera, gl, scene } = useThree();
  const controlsRef = useRef<any>(null); // Will grab OrbitControls
  const raycaster = useRef(new THREE.Raycaster()).current;
  const mouse = useRef(new THREE.Vector2()).current;
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)).current;
  const offset = useRef(new THREE.Vector3());
  const intersection = useRef(new THREE.Vector3());
  const [dragging, setLocalDragging] = useState(false);

  // Find OrbitControls and store reference
  useEffect(() => {
    controlsRef.current = scene.children.find((child: any) => child.type === 'OrbitControls');
  }, [scene]);

  // Load texture if available
  useEffect(() => {
    if (textureUrl) {
      const texture = new TextureLoader().load(textureUrl);
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ map: texture });
        }
      });
    }
  }, [obj, textureUrl]);

  // Get intersection between mouse and plane
  const getIntersects = (event: PointerEvent | MouseEvent | any) => {
    const bounds = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersection.current);
  };

  const onPointerDown = (event: any) => {
    event.stopPropagation();
    if (!meshRef.current) return;
    getIntersects(event);

    offset.current.copy(intersection.current).sub(meshRef.current.position);
    setDragging(true);
    setLocalDragging(true);

    if (controlsRef.current) controlsRef.current.enabled = false;
  };

  const onPointerUp = () => {
    setDragging(false);
    setLocalDragging(false);
    if (controlsRef.current) controlsRef.current.enabled = true;
  };

  const onPointerMove = (event: any) => {
    if (!dragging || !meshRef.current) return;
    getIntersects(event);
    meshRef.current.position.copy(intersection.current.sub(offset.current));

    // Send the new position to the parent component
    onPositionChange([meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z]);
  };

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragging]);

  return (
      <group
          ref={meshRef}
          position={initialPosition}
          scale={scale}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
      >
        <primitive object={obj} />
      </group>
  );
};

export default DraggableModel;
