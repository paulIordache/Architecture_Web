import React from 'react';
import DraggableModel from '../../models/DraggableModel';
import { PlacedObject } from './types';

interface PlacedFurnitureModelProps {
    placedObject: PlacedObject;
    isSelected: boolean;
    setDragging: (dragging: boolean) => void;
    onSelect: () => void;
    onPositionChange: (newPosition: [number, number, number], newRotation: number) => void;
}

const PlacedFurnitureModel: React.FC<PlacedFurnitureModelProps> = ({
                                                                       placedObject,
                                                                       isSelected,
                                                                       setDragging,
                                                                       onSelect,
                                                                       onPositionChange,
                                                                   }) => {
    const { furniture } = placedObject;

    if (!furniture || !furniture.obj_file_path) return null;

    const objUrl = `http://localhost:8080/${furniture.obj_file_path.replace('objects/', '')}`;
    const textureUrl = furniture.texture_path
        ? `http://localhost:8080/${furniture.texture_path.replace('objects/', '')}`
        : '';

    return (
        <DraggableModel
            objUrl={objUrl}
            textureUrl={textureUrl}
            setDragging={setDragging}
            initialPosition={[placedObject.x, placedObject.y, placedObject.z]}
            initialRotation={placedObject.rotation ?? 0}
            scale={[1.0, 1.0, 1.0]}
            isSelected={isSelected}
            onClick={onSelect}
            onPositionChange={(newPosition, newRotation) => onPositionChange(newPosition, newRotation)}
        />
    );
};

export default PlacedFurnitureModel;