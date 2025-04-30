'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRouter, useParams } from 'next/navigation';
import Model from '../../models/Model';
import DraggableModel from '../../models/DraggableModel';
import { useAsset } from '../../hooks/useAsset';

interface Project {
    id: number;
    name: string;
    room_layout_id: number;
}

interface Furniture {
    id: number;
    name: string;
    obj_file_path: string;
    texture_path: string;
    thumbnail_path: string;
}

interface PlacedObject {
    id: number;
    x: number;
    y: number;
    z: number;
    project_id: number;
    furniture_id: number;
    furniture: Furniture;
}

const ProjectPage = () => {
    const params = useParams();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [roomLayoutId, setRoomLayoutId] = useState<string | null>(null);
    const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
    const [isDragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<PlacedObject | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const router = useRouter();

    const {
        asset: roomLayout,
        loading: roomLoading,
        error: roomError
    } = useAsset(roomLayoutId || '');

    const fetchPlacedFurniture = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const objectsRes = await fetch(`http://localhost:8080/api/users/projects/${projectId}/furniture`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!objectsRes.ok) {
                const errorData = await objectsRes.json();
                throw new Error(errorData.error || `Failed to fetch objects: ${objectsRes.statusText}`);
            }

            const objectsData = await objectsRes.json();
            setPlacedObjects(objectsData);

            // Clear selected object if it was deleted or doesn't exist anymore
            if (selectedObject) {
                const stillExists = objectsData.some((obj: PlacedObject) => obj.id === selectedObject.id);
                if (!stillExists) {
                    setSelectedObject(null);
                }
            }
        } catch (error: any) {
            console.error("Error fetching furniture:", error);
            setError(error.message || 'Failed to load furniture data');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Not authenticated. Please log in.');
            router.push('/login');
            return;
        }

        const fetchProjectData = async () => {
            try {
                setLoading(true);

                const projectRes = await fetch(`http://localhost:8080/api/projects_id/${projectId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!projectRes.ok) {
                    const errorData = await projectRes.json();
                    throw new Error(errorData.error || `Failed to fetch project data: ${projectRes.statusText}`);
                }

                const projectData = await projectRes.json();
                setProject(projectData);

                if (projectData.room_layout_id) {
                    setRoomLayoutId(projectData.room_layout_id.toString());
                }

                await fetchPlacedFurniture();

            } catch (error: any) {
                console.error("Error fetching project data:", error);
                setError(error.message || 'Failed to load project data');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId, router]);

    const handlePositionChange = async (placedObject: PlacedObject, newPosition: [number, number, number]) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication error. Please login again.');
            return;
        }

        try {
            console.log(`Updating furniture ${placedObject.id} position to:`, newPosition);

            const response = await fetch(`http://localhost:8080/api/furniture/${placedObject.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    x: newPosition[0],
                    y: newPosition[1],
                    z: newPosition[2]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update furniture position');
            }

            const updatedFurniture = await response.json();

            // Update local state with the returned data
            setPlacedObjects(prev =>
                prev.map(obj => obj.id === placedObject.id ? updatedFurniture : obj)
            );

            // Update selected object if it was the one being moved
            if (selectedObject && selectedObject.id === placedObject.id) {
                setSelectedObject(updatedFurniture);
            }

            console.log('Furniture position updated successfully');
        } catch (error: any) {
            console.error('Error updating position:', error);
            setError(error.message || 'Failed to update furniture position');
        }
    };

    const handleDeleteFurniture = async () => {
        if (!selectedObject) return;

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication error. Please login again.');
            return;
        }

        try {
            setDeleteError(null);
            console.log(`Deleting furniture with ID: ${selectedObject.id}`);

            const response = await fetch(`http://localhost:8080/api/furniture/delete/${selectedObject.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete furniture');
            }

            console.log('Furniture deleted successfully');

            // Remove from local state and clear selection
            setPlacedObjects(prev => prev.filter(obj => obj.id !== selectedObject.id));
            setSelectedObject(null);
        } catch (error: any) {
            console.error('Error deleting furniture:', error);
            setDeleteError(error.message || 'Failed to delete furniture');
        }
    };

    const selectObject = (object: PlacedObject) => {
        if (selectedObject?.id === object.id) {
            setSelectedObject(null);
        } else {
            setSelectedObject(object);
        }
    };

    const PlacedFurnitureModel = ({ placedObject }: { placedObject: PlacedObject }) => {
        const { furniture } = placedObject;
        const isSelected = selectedObject?.id === placedObject.id;

        if (!furniture || !furniture.obj_file_path) return null;

        const objUrl = `http://localhost:8080/${furniture.obj_file_path.replace('objects/', '')}`;
        const textureUrl = furniture.texture_path
            ? `http://localhost:8080/${furniture.texture_path.replace('objects/', '')}`
            : '';

        return (
            <DraggableModel
                key={`furniture-${placedObject.id}`}
                objUrl={objUrl}
                textureUrl={textureUrl}
                setDragging={setDragging}
                initialPosition={[placedObject.x, placedObject.y, placedObject.z]}
                scale={[0.009, 0.009, 0.009]}
                isSelected={isSelected}
                onClick={() => selectObject(placedObject)}
                onPositionChange={(newPosition) => handlePositionChange(placedObject, newPosition)}
            />
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading project...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg max-w-md">
                    <h2 className="text-red-500 text-xl mb-4">Error</h2>
                    <p className="text-white">{error}</p>
                    <button
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() => router.push('/')}
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-900">
            <div className="absolute top-4 left-4 z-10">
                <h1 className="text-white text-2xl font-bold">{project?.name || 'Project View'}</h1>
                <button
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    onClick={() => router.push('/')}
                >
                    Back to Dashboard
                </button>
            </div>

            <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                <gridHelper args={[20, 20, '#555', '#aaa']} />
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

                {placedObjects.map((object) => (
                    <PlacedFurnitureModel key={`placed-${object.id}`} placedObject={object} />
                ))}
            </Canvas>

            {/* Object Info Panel */}
            <div className="absolute bottom-4 right-4 z-10 bg-gray-800 p-4 rounded-lg text-white">
                <p>Objects placed: {placedObjects.length}</p>
                <p className="text-xs text-gray-400 mt-1">
                    Click to select | Drag to position | Scroll to zoom
                </p>

                {selectedObject && (
                    <div className="mt-4 border-t border-gray-700 pt-2">
                        <p className="font-bold">{selectedObject.furniture.name}</p>
                        <p className="text-xs mt-1">Position:
                            X: {selectedObject.x.toFixed(2)},
                            Y: {selectedObject.y.toFixed(2)},
                            Z: {selectedObject.z.toFixed(2)}
                        </p>
                        <button
                            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                            onClick={handleDeleteFurniture}
                        >
                            Delete
                        </button>

                        {deleteError && (
                            <p className="text-red-400 text-xs mt-2">{deleteError}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectPage;