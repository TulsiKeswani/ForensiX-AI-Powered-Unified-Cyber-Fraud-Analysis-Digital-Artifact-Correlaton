import api from './api';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'INVESTIGATOR' | 'ADMIN';
  name: string;
  badgeNumber: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: UserProfile;
  error?: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const res: any = await api.post('/auth/login', { username, password });
    if (res.success && res.token) {
      localStorage.setItem('forensix_token', res.token);
      localStorage.setItem('forensix_user', JSON.stringify(res.user));
    }
    return res;
  },

  async register(data: { name: string; username: string; email: string; password: string; badgeNumber?: string; role?: string }): Promise<LoginResponse> {
    const res: any = await api.post('/auth/register', data);
    if (res.success && res.token) {
      localStorage.setItem('forensix_token', res.token);
      localStorage.setItem('forensix_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout() {
    localStorage.removeItem('forensix_token');
    localStorage.removeItem('forensix_user');
  },

  getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem('forensix_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('forensix_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

export default authService;
