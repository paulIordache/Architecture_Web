'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Model from '../models/Model';
import { useRooms } from '../hooks/useRoom';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAsset } from '@/app/hooks/useAsset';
import jwt_decode from 'jwt-decode';

const CreateProjectPage: React.FC = () => {
    const { rooms, loading } = useRooms();
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const router = useRouter();

    const {
        asset: selectedRoom,
        loading: assetLoading,
        error: assetError,
    } = useAsset(selectedRoomId ? selectedRoomId.toString() : '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRoomId) return;

        // Check for JWT token in localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in again');
            router.push('/login');
            return;
        }

        // Check for token expiration
        try {
            const decodedToken = jwt_decode(token);
            const currentTime = Date.now() / 1000; // Current time in seconds

            if (decodedToken.exp < currentTime) {
                alert('Session expired. Please log in again.');
                localStorage.removeItem('token');
                router.push('/login');
                return;
            }
        } catch (error) {
            alert('Invalid token. Please log in again.');
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

        try {
            // Make the API request to create the project
            const res = await axios.post(
                'http://localhost:8080/api/projects',
                {
                    name: projectName,
                    description,
                    room_layout_id: selectedRoomId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const project = res.data;
            router.push(`/project/${project.id}`);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                alert('Authentication failed. Please log in again.');
                router.push('/login');
            } else {
                alert('Failed to create project. Please try again.');
            }
        }
    };

    if (loading) return <div className="text-white p-8">Loading rooms...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-2xl mb-4">Create a New Project</h1>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project name"
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    required
                />

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Project description (optional)"
                    className="w-full p-2 rounded bg-gray-800 text-white"
                />

                <select
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    onChange={(e) => setSelectedRoomId(parseInt(e.target.value))}
                    value={selectedRoomId?.toString() ?? ''} // Cast to string explicitly, or use '' if null
                >
                    <option value="">Select a room layout</option>
                    {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                            {room.name}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    disabled={!selectedRoomId} // Disable if no room is selected
                >
                    Create Project
                </button>
            </form>

            {assetLoading && selectedRoomId && (
                <p className="text-gray-400 mt-4">Loading 3D preview...</p>
            )}

            {selectedRoom?.object && (
                <div className="mt-10 w-full max-w-md h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
                        <ambientLight intensity={0.5} />
                        <spotLight position={[5, 5, 5]} intensity={0.7} />
                        <Model
                            objUrl={
                                selectedRoom.object.startsWith('http')
                                    ? selectedRoom.object
                                    : `http://localhost:8080/assets/${selectedRoom.object}`
                            }
                            textureUrl={
                                selectedRoom.texture
                                    ? (selectedRoom.texture.startsWith('http')
                                        ? selectedRoom.texture
                                        : `http://localhost:8080/assets/${selectedRoom.texture}`)
                                    : '' // ✅ fallback: empty string or use a default texture URL
                            }
                        />
                        <OrbitControls />
                    </Canvas>
                </div>
            )}

            {/* Error handling for asset loading */}
            {assetError && (
                <div className="mt-4 text-red-500">
                    Error loading room assets. Please try again later.
                </div>
            )}
        </div>
    );
};

export default CreateProjectPage;
