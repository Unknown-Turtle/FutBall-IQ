import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized) - Refresh token or redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Here you can implement token refresh logic
      // const refreshToken = localStorage.getItem('refresh_token');
      // Attempt to refresh the token...
      
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Social Media Related API Calls
export const socialApi = {
  // Posts
  getPosts: (page = 1) => api.get(`/posts?page=${page}`),
  createPost: (data: { content: string; media?: File[] }) => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.media) {
      data.media.forEach((file, index) => {
        formData.append(`media[${index}]`, file);
      });
    }
    return api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  likePost: (postId: number) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId: number) => api.delete(`/posts/${postId}/like`),
  
  // Comments
  getComments: (postId: number, page = 1) => 
    api.get(`/posts/${postId}/comments?page=${page}`),
  createComment: (postId: number, content: string) => 
    api.post(`/posts/${postId}/comments`, { content }),
  
  // User Profiles
  getUserProfile: (userId: number) => api.get(`/users/${userId}/profile`),
  updateUserProfile: (data: {
    name?: string;
    bio?: string;
    avatar?: File;
  }) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.bio) formData.append('bio', data.bio);
    if (data.avatar) formData.append('avatar', data.avatar);
    
    return api.post('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Follow System
  followUser: (userId: number) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId: number) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId: number, page = 1) => 
    api.get(`/users/${userId}/followers?page=${page}`),
  getFollowing: (userId: number, page = 1) => 
    api.get(`/users/${userId}/following?page=${page}`)
};

// Types for social media features
export interface Post {
  id: number;
  content: string;
  user: User;
  media: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked: boolean;
}

export interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export interface Comment {
  id: number;
  content: string;
  user: User;
  created_at: string;
}

export default api; 