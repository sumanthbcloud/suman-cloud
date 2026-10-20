import {
  fetchJson,
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  setStoredUser,
  getStoredUser,
} from './api';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface VerifyPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
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

  async verify(payload: VerifyPayload): Promise<GenericResponse> {
    return fetchJson<GenericResponse>('/api/auth/verify', {
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
      name: name || payload.email.split('@')[0],
      email: payload.email,
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
