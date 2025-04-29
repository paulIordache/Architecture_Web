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
    const router = useRouter();

    const {
        asset: roomLayout,
        loading: roomLoading,
        error: roomError
    } = useAsset(roomLayoutId || '');

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

                if (!projectRes.ok) throw new Error(`Failed to fetch project data: ${projectRes.statusText}`);
                const projectData = await projectRes.json();
                setProject(projectData);

                if (projectData.room_layout_id) {
                    setRoomLayoutId(projectData.room_layout_id.toString());
                }

                const objectsRes = await fetch(`http://localhost:8080/api/users/projects/${projectId}/furniture`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!objectsRes.ok) throw new Error(`Failed to fetch objects: ${objectsRes.statusText}`);
                const objectsData = await objectsRes.json();
                setPlacedObjects(objectsData);

            } catch (error: any) {
                setError(error.message || 'Failed to load project data');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId, router]);

    const PlacedFurnitureModel = ({ placedObject }: { placedObject: PlacedObject }) => {
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
                scale={[0.009, 0.009, 0.009]}
                onPositionChange={(newPosition) => {
                    // Save to state, database, or Redux
                    console.log("Object moved to:", newPosition);
                }}
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
                    <PlacedFurnitureModel key={object.id} placedObject={object} />
                ))}
            </Canvas>

            <div className="absolute bottom-4 right-4 z-10 bg-gray-800 p-4 rounded-lg text-white">
                <p>Objects placed: {placedObjects.length}</p>
                <p className="text-xs text-gray-400 mt-1">
                    Drag to position objects | Scroll to zoom | Right-click to rotate view
                </p>
            </div>
        </div>
    );
};

export default ProjectPage;
