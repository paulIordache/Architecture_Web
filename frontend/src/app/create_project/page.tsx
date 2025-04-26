'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Model from '../models/Model';
import { useRooms } from '../hooks/useRoom';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAsset } from '@/app/hooks/useAsset';

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
        const token = localStorage.getItem('authToken');
        console.log('Token from localStorage:', token); // Add this for debuggingz

        if (!token) {
            alert('Please log in again');
            router.push('/login');
            return;
        }

        // Check for token expiration
        // try {
        //     const decodedToken = jwt_decode(token);
        //     const currentTime = Date.now() / 1000; // Current time in seconds
        //
        //     if (decodedToken.exp < currentTime) {
        //         alert('Session expired. Please log in again.');
        //         localStorage.removeItem('token');
        //         router.push('/login');
        //         return;
        //     }
        // } catch (error) {
        //     alert('Invalid token. Please log in again.');
        //     localStorage.removeItem('token');
        //     router.push('/login');
        //     return;
        // }

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

    const token = localStorage.getItem('authToken');
    console.log('Token from localStorage:', token); // Add this for debuggingz

    if (loading) return <div className="text-white p-8">Loading rooms...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
                <h1 className="text-3xl font-bold text-center text-white mb-6">
                    Create a New Project
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block mb-1 text-sm text-gray-300">Project Name</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Enter project name"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm text-gray-300">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm text-gray-300">Room Layout</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setSelectedRoomId(parseInt(e.target.value))}
                            value={selectedRoomId?.toString() ?? ''}
                        >
                            <option value="">Select a room layout</option>
                            {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    {room.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-white font-semibold transition duration-200 disabled:opacity-50"
                        disabled={!selectedRoomId}
                    >
                        Create Project
                    </button>
                </form>

                {assetLoading && selectedRoomId && (
                    <p className="text-gray-400 text-center">Loading 3D preview...</p>
                )}

                {selectedRoom?.object && (
                    <div className="mt-6 w-full h-64 rounded-xl overflow-hidden bg-gray-900 shadow-inner">
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
                                        : ''
                                }
                            />
                            <OrbitControls />
                        </Canvas>
                    </div>
                )}

                {assetError && (
                    <div className="text-center text-red-500 mt-4">
                        Error loading room assets. Please try again later.
                    </div>
                )}
            </div>
        </div>
    );

};

export default CreateProjectPage;
