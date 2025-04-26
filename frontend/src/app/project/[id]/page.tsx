'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Model from '../../models/Model';
import FurnitureAsset from '../../models/FurnitureAsset';

interface Project {
    id: number;
    room_layout_id: number;
}

interface RoomLayout {
    obj_file_path: string;
    texture_path: string;
}

interface Furniture {
    id: number;
    x: number;
    y: number;
    z: number;
    furniture_id: number;
}

const RoomScene = ({ projectId }: { projectId: number }) => {
    const [roomLayout, setRoomLayout] = useState<RoomLayout | null>(null);
    const [furnitureList, setFurnitureList] = useState<Furniture[]>([]);
    const [isDragging, setDragging] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('No token found in localStorage');
            return;
        }

        const fetchData = async () => {
            try {
                console.log('Fetching project data...');
                const projectRes = await fetch(`http://localhost:8080/api/projects_id/1`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!projectRes.ok) throw new Error('Failed to fetch project data');
                const project: Project = await projectRes.json();
                console.log('Project data:', project);

                console.log('Fetching room layout...');
                const roomRes = await fetch(`http://localhost:8080/api/rooms/1`);
                if (!roomRes.ok) throw new Error('Failed to fetch room layout');
                const room = await roomRes.json();
                console.log('Room layout:', room);

                // Check if paths are valid
                const objFilePath = room.obj_file_path.startsWith('http')
                    ? room.obj_file_path
                    : `http://localhost:8080/assets/${room.obj_file_path}`;
                const texturePath = room.texture_path.startsWith('http')
                    ? room.texture_path
                    : `http://localhost:8080/assets/${room.texture_path}`;

                console.log('Room layout file paths:', objFilePath, texturePath);

                setRoomLayout({
                    obj_file_path: objFilePath,
                    texture_path: texturePath,
                });

                console.log('Fetching furniture...');
                const furnRes = await fetch(
                    `http://localhost:8080/api/users/projects/1/furniture`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!furnRes.ok) throw new Error('Failed to fetch furniture');
                const furnitureData: Furniture[] = await furnRes.json();
                console.log('Furniture data:', furnitureData);

                setFurnitureList(furnitureData);
            } catch (error) {
                console.error('Error loading scene:', error);
            }
        };

        fetchData();
    }, [projectId]);

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 5]} />
                <gridHelper args={[20, 20, '#555', '#aaa']} />
                <OrbitControls enabled={!isDragging} />

                {/* Render Room */}
                {roomLayout && (
                    <Model
                        objUrl={roomLayout.obj_file_path}
                        textureUrl={roomLayout.texture_path}
                    />
                )}

                {/* Render Furniture */}
                {furnitureList.length > 0 ? (
                    furnitureList.map((furniture, index) => (
                        <FurnitureAsset
                            key={`${furniture.id}-${index}`} // Using furniture.id + index for uniqueness
                            id={furniture.furniture_id}
                            x={furniture.x}
                            y={furniture.y}
                            z={furniture.z}
                            setDragging={setDragging}
                        />
                    ))
                ) : (
                    <p>No furniture found for this project.</p>
                )}
            </Canvas>
        </div>
    );
};

export default RoomScene;
