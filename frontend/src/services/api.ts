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
    headers: {
        'Content-Type': 'application/json',
    },
});

// Функции для работы с токенами
let accessToken: string | null = localStorage.getItem('access_token');

export const setAuthToken = (token: string | null) => {
    accessToken = token;
    if (token) {
        localStorage.setItem('access_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('access_token');
        delete api.defaults.headers.common['Authorization'];
    }
};

// Инициализация токена при загрузке
if (accessToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}

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
    login: async (username: string, password: string) => {
        const response = await api.post('/token/', { username, password });
        const { access, refresh } = response.data;
        setAuthToken(access);
        localStorage.setItem('refresh_token', refresh);
        return response.data;
    },
    register: (username: string, email: string, password: string) =>
        api.post('/register/', { username, email, password }),
    logout: () => {
        setAuthToken(null);
        localStorage.removeItem('refresh_token');
    },
    checkAuth: () => {
        return Promise.resolve({ data: { authenticated: !!accessToken } });
    },
    refreshToken: async () => {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        const response = await api.post('/token/refresh/', { refresh });
        setAuthToken(response.data.access);
        return response.data;
    },
};

// Интерсептор для обновления токена
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await authApi.refreshToken();
                return api(originalRequest);
            } catch (refreshError) {
                authApi.logout();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;