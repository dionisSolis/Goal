import axios from 'axios';
import { Goal, Subtask } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Глобальная переменная для CSRF токена
let csrfToken: string = '';

// Функция для получения CSRF токена
export const getCSRFToken = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/csrf/', {
            withCredentials: true,
        });
        csrfToken = response.data.csrfToken;
        api.defaults.headers.common['X-CSRFToken'] = csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('Ошибка получения CSRF:', error);
        return '';
    }
};

// Интерсептор для добавления CSRF токена в каждый запрос
api.interceptors.request.use((config) => {
    if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
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

export default api;