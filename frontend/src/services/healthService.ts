import { fetchJson } from './api';
import type { HealthResponse } from '../types';

export const healthService = {
  /**
   * Fetches the current health status of the backend API.
   * Calls GET /api/health
   */
  async getHealth(): Promise<HealthResponse> {
    return fetchJson<HealthResponse>('/api/health');
  },
};
