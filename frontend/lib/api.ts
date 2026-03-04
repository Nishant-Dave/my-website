import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token only on client side
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to handle 401/403 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/admin-login';
      }
    }
    return Promise.reject(error);
  }
);

export const blogAPI = {
  getPosts: (params?: any) => api.get('/posts/', { params }),
  getPostBySlug: (slug: string) => api.get(`/posts/${slug}/`),
  getCategories: () => api.get('/categories/'),
  getComments: (postId: number) => api.get('/comments/', { params: { post: postId } }),
  addComment: (data: any) => api.post('/comments/add/', data),
};

export const adminAPI = {
  login: (data: any) => api.post('/token/', data),
  getPendingComments: () => api.get('/moderation/comments/pending/'),
  toggleCommentApproval: (id: number) => api.patch(`/moderation/comments/${id}/toggle-approve/`),
};

export default api;
