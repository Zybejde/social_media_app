import { api } from './client';
import { User } from './auth';

// Types
interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

interface UserResponse {
  user: User;
  isFollowing: boolean;
}

interface FollowResponse {
  message: string;
  user: User;
}

// Users API functions
export const usersAPI = {
  // Get all users (with optional search)
  getUsers: async (search?: string, page = 1, limit = 20) => {
    let url = `/users?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return await api.get<UsersResponse>(url);
  },

  // Get user by ID
  getUser: async (userId: string) => {
    return await api.get<UserResponse>(`/users/${userId}`);
  },

  // Follow user
  followUser: async (userId: string) => {
    return await api.post<FollowResponse>(`/users/${userId}/follow`, {});
  },

  // Unfollow user
  unfollowUser: async (userId: string) => {
    return await api.post<FollowResponse>(`/users/${userId}/unfollow`, {});
  },

  // Get user's followers
  getFollowers: async (userId: string) => {
    return await api.get<{ followers: User[] }>(`/users/${userId}/followers`);
  },

  // Get users that a user is following
  getFollowing: async (userId: string) => {
    return await api.get<{ following: User[] }>(`/users/${userId}/following`);
  },
};

