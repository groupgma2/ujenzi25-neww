import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

interface CollectionResponse<T> {
  data: T[];
  meta?: { total: number; page: number; limit: number };
}

export function useApiCollection<T>(endpoint: string, params?: Record<string, unknown>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    api.get<CollectionResponse<T>>(endpoint, params).then((response) => {
      if (!active) return;
      if (response.error) {
        setError(response.error.message);
        setItems([]);
      } else {
        setItems(response.data?.data || []);
      }
      setIsLoading(false);
    });

    return () => { active = false; };
  }, [endpoint, JSON.stringify(params), version]);

  return { items, isLoading, error, refresh };
}
