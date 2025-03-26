'use client';

import React, { useState } from 'react';
import Scene from '../Three/Scene';
import { useAsset } from '../hooks/useAsset';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/Addons.js';
import Model from '../models/Model';
import { useRouter } from 'next/router';

const handleSubmit = async (e: React.FormEvent) => {

};


const ThreePage: React.FC = () => {
  const { asset, loading, error } = useAsset("1"); // fetch asset with ID "1"

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        {error ? error.message : 'No asset found'}
      </div>
    );
  }

  // Construct URL based on our static server rule:
  // Assuming asset.object and asset.texture already contain the proper filenames (e.g., "chair.obj")
  const objUrl = asset.object.startsWith('http')
    ? asset.object
    : `http://localhost:8080/assets/${asset.object}`;
  const textureUrl = asset.texture.startsWith('http')
    ? asset.texture
    : `http://localhost:8080/assets/${asset.texture}`;

  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      {/* 3D Room Preview */}
      <div className="mt-6 w-full max-w-md h-64 bg-gray-800 rounded-lg flex items-center justify-center">
          <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[5, 5, 5]} intensity={0.7} />
            <Model objUrl={objUrl} textureUrl={textureUrl}/>
            <OrbitControls />
          </Canvas>
      </div>
    </div>
  );
};

export default ThreePage;