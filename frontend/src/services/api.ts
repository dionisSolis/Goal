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

export const getCSRFToken = async () => {
    // Просто заглушка, CSRF отключён
    return '';
};

export default api;