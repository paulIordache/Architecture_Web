export interface Project {
    id: number;
    name: string;
    room_layout_id: number;
}

export interface Furniture {
    id: number;
    name: string;
    obj_file_path: string;
    texture_path: string;
    thumbnail_path: string;
}

export interface PlacedObject {
    id: number;
    x: number;
    y: number;
    z: number;
    project_id: number;
    furniture_id: number;
    furniture: Furniture;
    rotation: number; // Rotation around Y-axis in radians
}