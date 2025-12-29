import { api } from './client';
import { User } from './auth';

// Types
export interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  image: string | null;
  likes: string[];
  likesCount: number;
  comments: Comment[];
  commentsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  visibility: 'public' | 'followers' | 'private';
  createdAt: string;
  updatedAt: string;
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

interface SinglePostResponse {
  post: Post;
}

interface LikeResponse {
  message: string;
  isLiked: boolean;
  likesCount: number;
}

interface SaveResponse {
  message: string;
  isSaved: boolean;
}

interface CommentResponse {
  message: string;
  comment: Comment;
  commentsCount: number;
}

// Posts API functions
export const postsAPI = {
  // Get feed posts
  getFeed: async (page = 1, limit = 20) => {
    return await api.get<PostsResponse>(`/posts?page=${page}&limit=${limit}`);
  },

  // Get user's posts
  getUserPosts: async (userId: string, page = 1, limit = 20) => {
    return await api.get<PostsResponse>(`/posts?userId=${userId}&page=${page}&limit=${limit}`);
  },

  // Get single post
  getPost: async (postId: string) => {
    return await api.get<SinglePostResponse>(`/posts/${postId}`);
  },

  // Create post
  createPost: async (content: string, image?: string, visibility = 'public') => {
    return await api.post<{ message: string; post: Post }>('/posts', {
      content,
      image,
      visibility,
    });
  },

  // Delete post
  deletePost: async (postId: string) => {
    return await api.delete<{ message: string }>(`/posts/${postId}`);
  },

  // Like/unlike post
  toggleLike: async (postId: string) => {
    return await api.post<LikeResponse>(`/posts/${postId}/like`, {});
  },

  // Save/unsave post
  toggleSave: async (postId: string) => {
    return await api.post<SaveResponse>(`/posts/${postId}/save`, {});
  },

  // Add comment
  addComment: async (postId: string, text: string) => {
    return await api.post<CommentResponse>(`/posts/${postId}/comments`, { text });
  },

  // Get saved posts
  getSavedPosts: async () => {
    return await api.get<{ posts: Post[] }>('/posts/saved/me');
  },

  // Get liked posts
  getLikedPosts: async () => {
    return await api.get<{ posts: Post[] }>('/posts/liked/me');
  },
};

