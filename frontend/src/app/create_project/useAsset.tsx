import { useState, useEffect } from 'react';

export interface AssetData {
  object: string;
  texture: string;
}

export function useAsset(assetId: string): { asset: AssetData | null; loading: boolean; error: Error | null } {
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAsset() {
      try {
        const res = await fetch(`http://localhost:8080/api/assets/${assetId}`);
        if (!res.ok) {
          throw new Error('Asset not found');
        }
        const data: AssetData = await res.json();
        setAsset(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [assetId]);

  return { asset, loading, error };
}