import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/admin-login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/token/', { username, password }),
  
  refreshToken: (refresh: string) =>
    api.post('/token/refresh/', { refresh }),
};

// Blog endpoints (public)
export const blogAPI = {
  getPosts: (params?: Record<string, any>) =>
    api.get('/posts/', { params }),
  
  getPostBySlug: (slug: string) =>
    api.get(`/posts/${slug}/`),
  
  getCategories: () =>
    api.get('/categories/'),
};

// Comments endpoints
export const commentsAPI = {
  getComments: (params?: Record<string, any>) =>
    api.get('/comments/', { params }),
  
  addComment: (data: {
    post: number;
    name: string;
    email: string;
    body: string;
  }) => api.post('/comments/add/', data),
};

// Moderation endpoints (admin only)
export const moderationAPI = {
  getPendingComments: () =>
    api.get('/moderation/comments/pending/'),
  
  toggleApproveComment: (commentId: number) =>
    api.patch(`/moderation/comments/${commentId}/toggle-approve/`),
};

export default api;
