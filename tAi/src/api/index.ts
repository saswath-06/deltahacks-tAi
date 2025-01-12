// src/api/index.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth types
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  name: string;
}

// API response types
interface AuthResponse {
  token: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface UserStats {
  streak: number;
  knowledge_level: Record<string, number>;
}

// Auth API
export const auth = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/login', data);
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/register', data);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Topics API
export const topics = {
  getAll: async (): Promise<Topic[]> => {
    const response = await api.get('/topics');
    return response.data.topics;
  },
  
  add: async (topic: Omit<Topic, 'id'>): Promise<Topic> => {
    const response = await api.post('/topics', topic);
    return response.data;
  },
};

// Progress API
export const progress = {
  update: async (topicId: string, progress: number): Promise<void> => {
    await api.post('/progress', { topic: topicId, progress });
  },
  
  getStats: async (): Promise<UserStats> => {
    const response = await api.get('/stats');
    return response.data;
  },
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      auth.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;