import React, { useState, useEffect } from 'react';
import { useFrame, useThree, ThreeEvent, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { TextureLoader } from 'three';

export interface ModelProps {
    objUrl: string;
    textureUrl: string;
}

const Model: React.FC<ModelProps> = ({ objUrl, textureUrl }) => {
    const obj = useLoader(OBJLoader, objUrl);
    const texture = useLoader(TextureLoader, textureUrl);

    // Traverse and apply texture to the model
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

    // Always set the position of the room model to [0, 0, 0]
    return <primitive object={obj} position={[0, 0, 0]} />;
};

export default Model;
