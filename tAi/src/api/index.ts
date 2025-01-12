import axios from 'axios';

// Types
export interface User {
    id: string;
    email: string;
    name: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface StudySession {
    id: number;
    startTime: string;
    endTime?: string;
    duration: number;
    status: 'active' | 'completed' | 'cancelled';
}

export interface StudyMaterial {
    id: number;
    driveFileId: string;
    filename: string;
    contentSummary?: string;
    topics: string[];
    lastAccessed: string;
}

// API Base Configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth APIs
export const auth = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    register: async (email: string, password: string, name: string) => {
        const response = await api.post('/auth/register', { email, password, name });
        return response.data;
    },
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },
};

// AI Tutor APIs
export const aiTutor = {
    sendMessage: async (message: string): Promise<ChatMessage> => {
        const response = await api.post('/tutor/chat', { message });
        return response.data;
    },

    getUserProgress: async () => {
        const response = await api.get('/tutor/progress');
        return response.data;
    },

    startSession: async (duration?: number) => {
        const response = await api.post('/tutor/start-pomodoro', { duration });
        return response.data;
    },

    endSession: async (sessionId: number) => {
        const response = await api.post('/tutor/end-pomodoro', { session_id: sessionId });
        return response.data;
    },
};

// Google Drive APIs
export const drive = {
    listFiles: async () => {
        const response = await api.get('/drive/files');
        return response.data;
    },

    processMaterial: async (fileId: string) => {
        const response = await api.post('/drive/process', { file_id: fileId });
        return response.data;
    },

    getAuthUrl: async () => {
        const response = await api.get('/drive/auth-url');
        return response.data;
    },

    handleAuthCallback: async (code: string) => {
        const response = await api.post('/drive/oauth-callback', { code });
        return response.data;
    },
};

export default {
    auth,
    aiTutor,
    drive,
};