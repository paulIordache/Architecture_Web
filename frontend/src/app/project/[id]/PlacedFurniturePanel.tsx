'use client';

import React from 'react';
import { PlacedObject } from './types';

interface PlacedFurniturePanelProps {
    show: boolean;
    onClose: () => void;
    placedObjects: PlacedObject[];
    deleteError: string | null;
    handleDeleteFurniture: (furnitureId: number) => void;
    handlePositionChange: (object: PlacedObject, newPosition: [number, number, number], newRotation: number) => void;
}

const PlacedFurniturePanel: React.FC<PlacedFurniturePanelProps> = ({
                                                                       show,
                                                                       onClose,
                                                                       placedObjects,
                                                                       deleteError,
                                                                       handleDeleteFurniture,
                                                                       handlePositionChange,
                                                                   }) => {
    if (!show) return null;

    return (
        <div className="absolute right-4 top-16 z-20 bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-xl p-4 max-h-[70vh] overflow-y-auto w-64 transition-all duration-300 font-sans">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-100 tracking-tight">Placed Furniture</h3>
                <button
                    className="text-gray-400 hover:text-gray-100 text-xl transition-all duration-200 transform hover:scale-110"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            {deleteError && (
                <div className="bg-red-900/80 text-red-200 p-2 rounded-lg mb-4 text-sm tracking-tight">
                    {deleteError}
                </div>
            )}

            {placedObjects.length === 0 ? (
                <p className="text-gray-400 text-sm tracking-tight">No furniture placed in this project.</p>
            ) : (
                <div className="space-y-3">
                    {placedObjects.map(placedObject => (
                        <div
                            key={placedObject.id}
                            className="bg-gray-700/80 p-3 rounded-lg transition-all duration-200 hover:bg-gray-600/80"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-14 h-14 mr-3 bg-gray-600/50 rounded-lg overflow-hidden flex items-center justify-center">
                                        {placedObject.furniture.thumbnail_path ? (
                                            <img
                                                src={`http://localhost:8080/${placedObject.furniture.thumbnail_path.replace('objects/', '')}`}
                                                alt={placedObject.furniture.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                                                }}
                                            />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-100 tracking-tight">{placedObject.furniture.name}</p>
                                </div>
                                <button
                                    className="bg-red-700 hover:bg-red-800 text-gray-100 px-4 py-1 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105"
                                    onClick={() => handleDeleteFurniture(placedObject.id)}
                                >
                                    Delete
                                </button>
                            </div>
                            <div className="mt-2">
                                <label className="text-xs text-gray-300">Rotate (degrees):</label>
                                <input
                                    type="range"
                                    min={-180}
                                    max={180}
                                    step={1}
                                    value={(placedObject.rotation ?? 0) * 180 / Math.PI}
                                    onChange={(e) => {
                                        const newRotation = (parseFloat(e.target.value) * Math.PI) / 180;
                                        console.log('Slider changed:', { id: placedObject.id, newRotation });
                                        handlePositionChange(placedObject, [placedObject.x, placedObject.y, placedObject.z], newRotation);
                                    }}
                                    className="w-full mt-1"
                                />
                                <p className="text-xs text-gray-300 mt-1">
                                    Rotation: {((placedObject.rotation ?? 0) * 180 / Math.PI).toFixed(2)}°
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlacedFurniturePanel;