import {
  fetchJson,
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  setStoredUser,
  getStoredUser,
} from './api';

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  name?: string;
  email?: string;
  message?: string;
}

export interface GenericResponse {
  message: string;
}

export const authService = {
  async signup(payload: SignupPayload): Promise<GenericResponse> {
    return fetchJson<GenericResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload, name?: string): Promise<LoginResponse> {
    const res = await fetchJson<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.token);
    setStoredUser({
      name: res.name || name || payload.identifier,
      email: res.email || payload.identifier,
    });
    return res;
  },

  logout(): void {
    removeAuthToken();
  },

  isAuthenticated(): boolean {
    return Boolean(getAuthToken());
  },

  getCurrentUser(): { name: string; email: string } | null {
    return getStoredUser();
  },
};
