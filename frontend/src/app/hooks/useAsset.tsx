import { useEffect, useState } from 'react';
import axios from 'axios';

export interface Asset {
  id: number;
  name: string;
  object: string;
  thumbnail: string;
  texture: string;
}

export const useAsset = (id: string) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await axios.get<Asset>(`http://localhost:8080/api/assets/${id}`);
        setAsset(res.data);
      } catch (err) {
        console.error("Error fetching asset:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  return { asset, loading, error };
};
