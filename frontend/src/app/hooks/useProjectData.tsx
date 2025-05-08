import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlacedObject, Project, Furniture } from '../project/[id]/types';

export const useProjectData = (projectId: string, router: ReturnType<typeof useRouter>) => {
    const [project, setProject] = useState<Project | null>(null);
    const [roomLayoutId, setRoomLayoutId] = useState<string | null>(null);
    const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
    const [availableFurniture, setAvailableFurniture] = useState<Furniture[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addFurnitureError, setAddFurnitureError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

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
            const normalizedObjects = Array.isArray(objectsData)
                ? objectsData.map((obj: PlacedObject) => ({
                    ...obj,
                    rotation: obj.rotation ?? 0,
                }))
                : [];
            setPlacedObjects(normalizedObjects);
        } catch (error: any) {
            console.error("Error fetching furniture:", error);
            setError(error.message || 'Failed to load furniture data');
            setPlacedObjects([]);
        }
    };

    const fetchAvailableFurniture = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            try {
                const res = await fetch('http://localhost:8080/api/furniture/all', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch available furniture: ${res.statusText}`);
                }

                const furnitureData = await res.json();
                setAvailableFurniture(furnitureData);
            } catch (fetchError) {
                console.warn("Endpoint for available furniture not found, using mock data:", fetchError);
                setAvailableFurniture([
                    {
                        id: 1,
                        name: "Chair",
                        obj_file_path: "chair.obj",
                        texture_path: "chair_texture.jpg",
                        thumbnail_path: "chair_thumbnail.jpg",
                    },
                    {
                        id: 2,
                        name: "Table",
                        obj_file_path: "table.obj",
                        texture_path: "table_texture.jpg",
                        thumbnail_path: "table_thumbnail.jpg",
                    },
                    {
                        id: 3,
                        name: "Sofa",
                        obj_file_path: "objects/sofa.obj",
                        texture_path: "objects/sofa_texture.jpg",
                        thumbnail_path: "objects/sofa_thumbnail.jpg",
                    },
                ]);
            }
        } catch (error: any) {
            console.error("Error in furniture fetching process:", error);
            setError(error.message || 'Failed to load available furniture');
        }
    };

    const fetchProjectData = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Not authenticated. Please log in.');
            }

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

            await Promise.all([fetchPlacedFurniture(), fetchAvailableFurniture()]);
        } catch (error: any) {
            console.error("Error fetching project data:", error);
            setError(error.message || 'Failed to load project data');
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [projectId]);

    const handlePositionChange = async (placedObject: PlacedObject, newPosition: [number, number, number], newRotation: number) => {
        console.log('handlePositionChange called:', { id: placedObject.id, newPosition, newRotation });

        // Optimistically update the state
        setPlacedObjects(prev =>
            prev.map(obj =>
                obj.id === placedObject.id
                    ? { ...obj, x: newPosition[0], y: newPosition[1], z: newPosition[2], rotation: newRotation }
                    : obj
            )
        );

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication error. Please login again.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/furniture/${placedObject.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    x: newPosition[0],
                    y: newPosition[1],
                    z: newPosition[2],
                    rotation: newRotation,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error:', errorData);
                throw new Error(errorData.error || 'Failed to update furniture position and rotation');
            }

            const updatedFurniture = await response.json();
            console.log('API response:', updatedFurniture);
            setPlacedObjects(prev =>
                prev.map(obj =>
                    obj.id === placedObject.id
                        ? { ...updatedFurniture, rotation: updatedFurniture.rotation ?? 0 }
                        : obj
                )
            );
        } catch (error: any) {
            console.error('Error updating position and rotation:', error);
            setError(error.message || 'Failed to update furniture position and rotation');
            // Revert optimistic update if needed
            setPlacedObjects(prev =>
                prev.map(obj =>
                    obj.id === placedObject.id
                        ? { ...obj, x: placedObject.x, y: placedObject.y, z: placedObject.z, rotation: placedObject.rotation }
                        : obj
                )
            );
        }
    };

    const handleDeleteFurniture = async (furnitureId: number) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication error. Please login again.');
            return;
        }

        try {
            setDeleteError(null);
            const response = await fetch(`http://localhost:8080/api/furniture/delete/${furnitureId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete furniture');
            }

            setPlacedObjects(prev => prev.filter(obj => obj.id !== furnitureId));
        } catch (error: any) {
            console.error('Error deleting furniture:', error);
            setDeleteError(error.message || 'Failed to delete furniture');
        }
    };

    const handleAddFurniture = async (furniture: Furniture) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication error. Please login again.');
            return;
        }

        try {
            setAddFurnitureError(null);
            const newFurniture = {
                project_id: parseInt(projectId),
                furniture_id: furniture.id,
                x: 0,
                y: 0,
                z: 0,
                rotation: 0,
            };

            const response = await fetch('http://localhost:8080/api/furniture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newFurniture),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add furniture');
            }

            const addedFurniture = await response.json();
            setPlacedObjects(prev => {
                const newObjects = Array.isArray(prev) ? [...prev, { ...addedFurniture, rotation: addedFurniture.rotation ?? 0 }] : [addedFurniture];
                return newObjects;
            });
        } catch (error: any) {
            console.error('Error adding furniture:', error);
            setAddFurnitureError(error.message || 'Failed to add furniture');
        }
    };

    return {
        project,
        roomLayoutId,
        placedObjects,
        setPlacedObjects,
        availableFurniture,
        loading,
        error,
        addFurnitureError,
        deleteError,
        handleAddFurniture,
        handlePositionChange,
        handleDeleteFurniture,
    };
};