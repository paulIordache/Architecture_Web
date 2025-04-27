'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Model from '../../models/Model';
import DraggableModel from '../../models/DraggableModel';
import { useRouter, useParams } from 'next/navigation';
import { useAsset } from '../../hooks/useAsset'; // Import your useAsset hook

interface Asset {
    object: string;
    texture: string;
}

interface Project {
    id: number;
    name: string;
    room_layout_id: number;
}

interface RoomLayout {
    id: number;
    name: string;
    object: string;
    texture: string;
}

interface PlacedObject {
    id: number;
    x: number;
    y: number;
    z: number;
    asset_id: number;
}

const ProjectPage = () => {
    const params = useParams();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [roomLayout, setRoomLayout] = useState<RoomLayout | null>(null);
    const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
    const [assets, setAssets] = useState<Map<number, Asset>>(new Map());
    const [isDragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Fetch project data and assets
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
                    const roomRes = await fetch(`http://localhost:8080/api/rooms/${projectData.room_layout_id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!roomRes.ok) throw new Error(`Failed to fetch room layout: ${roomRes.statusText}`);
                    const roomData = await roomRes.json();

                    const objFilePath = roomData.object
                        ? (roomData.object.startsWith('http')
                            ? roomData.object
                            : `http://localhost:8080/api/assets/${roomData.object}`)
                        : '';

                    const texturePath = roomData.texture
                        ? (roomData.texture.startsWith('http')
                            ? roomData.texture
                            : `http://localhost:8080/assets/${roomData.texture}`)
                        : '';

                    setRoomLayout({
                        ...roomData,
                        object: objFilePath,
                        texture: texturePath,
                    });
                }

                const objectsRes = await fetch(`http://localhost:8080/api/users/projects/${projectId}/furniture`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!objectsRes.ok) throw new Error(`Failed to fetch objects: ${objectsRes.statusText}`);
                const objectsData = await objectsRes.json();

                const processedObjects = Array.isArray(objectsData)
                    ? objectsData.map((obj) => ({
                        ...obj,
                        asset_id: obj.asset_id,
                    }))
                    : [];

                setPlacedObjects(processedObjects);

            } catch (error: any) {
                setError(error.message || 'Failed to load project data');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId, router]);

    // Fetch assets only once and store them in state before rendering
    useEffect(() => {
        const fetchAssets = async () => {
            const fetchedAssets = new Map<number, Asset>();
            for (const object of placedObjects) {
                const asset = useAsset(object.asset_id); // Fetch asset data using the custom hook
                if (asset) {
                    fetchedAssets.set(object.asset_id, asset);
                }
            }
            setAssets(fetchedAssets);
        };

        if (placedObjects.length > 0) {
            fetchAssets(); // Fetch assets once placedObjects are available
        }
    }, [placedObjects]); // Re-run when placedObjects change

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
                        objUrl={roomLayout.object}
                        textureUrl={roomLayout.texture}
                    />
                )}

                {placedObjects.map((object) => {
                    const asset = assets.get(object.asset_id);
                    if (!asset) return null;

                    return (
                        <DraggableModel
                            key={object.id} // Add unique key prop for each model
                            objUrl={asset.object}
                            textureUrl={asset.texture}
                            setDragging={setDragging}
                            initialPosition={[object.x, object.y, object.z]}
                        />
                    );
                })}
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
