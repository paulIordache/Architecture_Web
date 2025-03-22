'use client';

import React from 'react';
import Scene from '../Three/Scene';
import { useAsset } from '../hooks/useAsset';

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
    <div className="h-screen bg-black">
      <Scene objUrl={objUrl} textureUrl={textureUrl} />
    </div>
  );
};

export default ThreePage;