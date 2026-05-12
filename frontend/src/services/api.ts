import axios from 'axios';
import { Goal, Subtask } from '../types';

const getApiUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'https://goal-tracker-backend-lc14.onrender.com/api';
    }
    return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getCSRFTokenFromCookie = () => {
    const name = 'csrftoken';
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
    return cookieValue || '';
};

api.interceptors.request.use((config) => {
    const token = getCSRFTokenFromCookie();
    if (token) {
        config.headers['X-CSRFToken'] = token;
    }
    return config;
});

export const goalApi = {
    getAll: () => api.get<Goal[]>('/goals/'),
    create: (data: Partial<Goal>) => api.post<Goal>('/goals/', data),
    delete: (id: number) => api.delete(`/goals/${id}/`),
    addSubtask: (goalId: number, title: string) => 
        api.post<Subtask>(`/goals/${goalId}/add_subtask/`, { title }),
    completeSubtask: (goalId: number, subtaskId: number) =>
        api.post(`/goals/${goalId}/complete_subtask/`, { subtask_id: subtaskId }),
};

export const authApi = {
    login: (username: string, password: string) => 
        api.post('/login/', { username, password }),
    logout: () => api.post('/logout/'),
    checkAuth: () => api.get('/check-auth/'),
};

export const initCSRF = async () => {
    try {
        await api.get('/csrf/');
        console.log('CSRF token initialized');
    } catch (error) {
        console.error('CSRF init error:', error);
    }
};

export default api;