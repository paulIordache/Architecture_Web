'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRouter, useParams } from 'next/navigation';
import Model from '../../models/Model';
import FurnitureSelectionPanel from './FurnitureSelectionPanel';
import PlacedFurniturePanel from './PlacedFurniturePanel';
import PlacedFurnitureModel from './PlacedFurnitureModel';
import { useProjectData } from '../../hooks/useProjectData';
import { useAsset } from '../../hooks/useAsset';
import { PlacedObject } from './types';

const ProjectPage = () => {
    const params = useParams();
    const projectId = params.id as string;
    const router = useRouter();

    const [isDragging, setDragging] = useState(false);
    const [selectedObject, setSelectedObject] = useState<PlacedObject | null>(null);
    const [showFurniturePanel, setShowFurniturePanel] = useState(false);
    const [showPlacedFurniturePanel, setShowPlacedFurniturePanel] = useState(false);

    const {
        project,
        roomLayoutId,
        placedObjects,
        setPlacedObjects,
        availableFurniture,
        loading,
        error,
        deleteError,
        addFurnitureError,
        handlePositionChange,
        handleDeleteFurniture,
        handleAddFurniture,
    } = useProjectData(projectId, router);

    const { asset: roomLayout } = useAsset(roomLayoutId || '');

    const selectObject = (object: PlacedObject) => {
        console.log('selectObject called:', object.id);
        if (selectedObject?.id === object.id) {
            setSelectedObject(null);
        } else {
            setSelectedObject({ ...object, rotation: object.rotation ?? 0 });
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-gradient-to-br from-gray-950 to-gray-800 flex items-center justify-center overflow-hidden">
                <div className="text-gray-200 text-xl font-semibold tracking-tight animate-pulse">
                    Loading project...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-full bg-gradient-to-br from-gray-950 to-gray-800 flex items-center justify-center overflow-hidden">
                <div className="bg-gray-800/90 shadow-xl p-8 rounded-xl max-w-md transform transition-all duration-300">
                    <h2 className="text-red-400 text-xl font-semibold mb-4 tracking-tight">Error</h2>
                    <p className="text-gray-200 mb-6">{error}</p>
                    <button
                        className="bg-gray-600 hover:bg-gray-700 text-gray-200 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105"
                        onClick={() => router.push('/')}
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gradient-to-br from-gray-950 to-gray-800 relative overflow-hidden font-sans">
            <div className="fixed top-0 left-0 right-0 z-30 bg-gray-800/60 backdrop-blur-lg shadow-lg flex items-center justify-between px-6 py-3">
                <h1 className="text-xl font-semibold text-gray-100 tracking-tight">
                    {project?.name || 'Project View'}
                </h1>
                <div className="flex gap-4">
                    <button
                        className="bg-gray-600/80 hover:bg-gray-700 text-gray-100 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105"
                        onClick={() => router.push('/')}
                    >
                        Dashboard
                    </button>
                    <button
                        className="bg-gray-600/80 hover:bg-gray-700 text-gray-100 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105"
                        onClick={() => setShowFurniturePanel(!showFurniturePanel)}
                    >
                        {showFurniturePanel ? 'Hide Furniture' : 'Add Furniture'}
                    </button>
                    <button
                        className="bg-gray-600/80 hover:bg-gray-700 text-gray-100 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105"
                        onClick={() => setShowPlacedFurniturePanel(!showPlacedFurniturePanel)}
                    >
                        {showPlacedFurniturePanel ? 'Hide Placed' : 'View Placed'}
                    </button>
                </div>
            </div>

            <FurnitureSelectionPanel
                show={showFurniturePanel}
                onClose={() => setShowFurniturePanel(false)}
                availableFurniture={availableFurniture}
                addFurnitureError={addFurnitureError}
                handleAddFurniture={handleAddFurniture}
            />

            <PlacedFurniturePanel
                show={showPlacedFurniturePanel}
                onClose={() => setShowPlacedFurniturePanel(false)}
                placedObjects={placedObjects}
                deleteError={deleteError}
                handleDeleteFurniture={handleDeleteFurniture}
                handlePositionChange={handlePositionChange}
            />

            <Canvas
                className="absolute top-12 bottom-0 left-0 right-0 border border-gray-700/50 rounded-lg shadow-inner"
                camera={{ position: [0, 5, 10], fov: 50 }}
            >
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                <gridHelper args={[20, 20, '#4B5563', '#6B7280']} />
                <OrbitControls enabled={!isDragging} />

                {roomLayout && roomLayout.object && (
                    <Model
                        objUrl={
                            roomLayout.object.startsWith('http')
                                ? roomLayout.object
                                : `http://localhost:8080/assets/${roomLayout.object.replace('objects/', '')}`
                        }
                        textureUrl={
                            roomLayout.texture
                                ? (roomLayout.texture.startsWith('http')
                                    ? roomLayout.texture
                                    : `http://localhost:8080/assets/${roomLayout.texture.replace('objects/', '')}`)
                                : ''
                        }
                    />
                )}

                {placedObjects?.map((object) => (
                    <PlacedFurnitureModel
                        key={object.id}
                        placedObject={{ ...object, rotation: object.rotation ?? 0 }}
                        isSelected={selectedObject?.id === object.id}
                        setDragging={setDragging}
                        onSelect={() => selectObject(object)}
                        onPositionChange={(newPosition, newRotation) => handlePositionChange(object, newPosition, newRotation)}
                    />
                ))}
            </Canvas>

            <div className="absolute bottom-4 right-4 z-20 bg-gray-800/90 backdrop-blur-sm shadow-xl p-4 rounded-xl text-gray-200 w-64 transform transition-all duration-300">
                <p className="text-sm font-medium tracking-tight">
                    Objects placed: {placedObjects?.length ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-1 tracking-tight">
                    Click to select | Drag to position | Scroll to zoom
                </p>

                {selectedObject && (
                    <div className="mt-4 border-t border-gray-700/50 pt-3">
                        <p className="font-semibold text-sm tracking-tight">
                            {selectedObject.furniture.name}
                        </p>
                        <p className="text-xs mt-1 text-gray-300 tracking-tight">
                            Position: X: {selectedObject.x.toFixed(2)}, Y: {selectedObject.y.toFixed(2)}, Z: {selectedObject.z.toFixed(2)}
                        </p>
                        <button
                            className="mt-3 bg-red-700 hover:bg-red-800 text-gray-100 px-4 py-1 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105"
                            onClick={() => handleDeleteFurniture(selectedObject.id)}
                        >
                            Delete
                        </button>
                        {deleteError && (
                            <p className="text-red-400 text-xs mt-2 tracking-tight">{deleteError}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectPage;