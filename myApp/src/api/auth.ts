import { api, setToken, removeToken } from './client';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

interface MeResponse {
  user: User;
}

// Auth API functions
export const authAPI = {
  // Login
  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    if (response.data?.token) {
      await setToken(response.data.token);
    }

    return response;
  },

  // Signup
  signup: async (name: string, email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/signup', {
      name,
      email,
      password,
    });

    if (response.data?.token) {
      await setToken(response.data.token);
    }

    return response;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout', {});
    await removeToken();
    return response;
  },

  // Get current user
  getMe: async () => {
    return await api.get<MeResponse>('/auth/me');
  },

  // Update profile
  updateProfile: async (data: { name?: string; bio?: string; avatar?: string }) => {
    return await api.put<{ message: string; user: User }>('/auth/update-profile', data);
  },
};

