import {useState, useEffect} from "react";
import axios from "axios";

export interface Room {
    id: number;
    name: string;
    object: string;
    texture: string
}

export const useRooms = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get('http://localhost:8080/api/rooms')
            .then((response) => {
                setRooms(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setError('Failed to get rooms');
                setLoading(false);
            })
    }, []);

    return {rooms, loading, error};
}