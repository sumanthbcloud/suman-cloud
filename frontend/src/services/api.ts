/**
 * Base API client configuration for SUMAN backend communication.
 * Connects to /api/ in Docker/production or VITE_API_BASE_URL in local dev.
 */
const rawBase = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : '';

export const API_BASE_URL = rawBase.replace(/\/$/, '');

export function getAuthToken(): string | null {
  return localStorage.getItem('suman_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('suman_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('suman_token');
  localStorage.removeItem('suman_user');
}

export function getStoredUser(): { name: string; email: string } | null {
  const userJson = localStorage.getItem('suman_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function setStoredUser(user: { name: string; email: string }): void {
  localStorage.setItem('suman_user', JSON.stringify(user));
}

export async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP error ${response.status}`;
    try {
      const err = await response.json();
      if (err.message) errorMsg = err.message;
      else if (err.error) errorMsg = err.error;
    } catch {
      // not JSON response
    }
    throw new Error(errorMsg);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return {} as T;
}

export async function uploadFileApi<T>(endpoint: string, formData: FormData): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = `Upload failed (${response.status})`;
    try {
      const err = await response.json();
      if (err.message) errorMsg = err.message;
    } catch {
      // not JSON response
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
