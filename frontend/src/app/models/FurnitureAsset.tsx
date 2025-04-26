'use client';

import React from 'react';
import { useAsset } from '../hooks/useAsset';
import DraggableModel from './DraggableModel';

interface Props {
    id: number;
    x: number;
    y: number;
    z: number;
    setDragging: (dragging: boolean) => void;
}

const FurnitureAsset: React.FC<Props> = ({ id, x, y, z, setDragging }) => {
    const { asset, loading, error } = useAsset(id.toString());

    if (loading || error || !asset) return null;

    return (
        <DraggableModel
            objUrl={asset.object}
            textureUrl={asset.texture}
            initialPosition={[x, y, z]}
            setDragging={setDragging}
        />
    );
};

export default FurnitureAsset;
