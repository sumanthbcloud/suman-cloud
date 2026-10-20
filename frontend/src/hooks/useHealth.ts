import { useState, useCallback } from 'react';
import { healthService } from '../services/healthService';
import type { HealthResponse } from '../types';

export function useHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await healthService.getHealth();
      setHealth(res);
      return res;
    } catch (err) {
      setError('Service unavailable. Please try again.');
      setHealth({ status: 'DOWN' });
      return { status: 'DOWN' as const };
    } finally {
      setLoading(false);
    }
  }, []);

  return { health, loading, error, checkHealth };
}
