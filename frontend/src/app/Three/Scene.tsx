'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import DraggableModel from './DraggableModel';

interface SceneProps {
  objUrl: string;
  textureUrl: string;
}

const Scene: React.FC<SceneProps> = ({ objUrl, textureUrl }) => {
  const [dragging, setDragging] = useState(false);

  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <DraggableModel objUrl={objUrl} textureUrl={textureUrl} setDragging={setDragging} />
      <OrbitControls enabled={!dragging} />
    </Canvas>
  );
};

export default Scene;