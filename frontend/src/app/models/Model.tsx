/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
/*eslint no-unused-vars: "warn"*/


import React, {useState} from 'react';
import {useFrame, useThree, ThreeEvent, useLoader} from '@react-three/fiber';
import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import { TextureLoader } from 'three';

export interface ModelProps {
    objUrl: string;
    textureUrl: string;
}

const Model: React.FC<ModelProps> = ({objUrl, textureUrl}) => {
    const obj = useLoader(OBJLoader, objUrl);
    const texture = useLoader(TextureLoader, textureUrl);

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

    return (
        <primitive
            object={obj}
        />
    );
};

export default Model;
