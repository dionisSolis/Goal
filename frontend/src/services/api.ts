import axios from 'axios';
import { Goal, Subtask } from '../types';

// Определяем API URL в зависимости от окружения
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://goal-tracker-backend-lc14.onrender.com/api';
  }
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiUrl();

console.log('API URL:', API_BASE_URL);  // Для отладки

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Функция для получения CSRF токена
export const getCSRFToken = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/csrf/`, {
            withCredentials: true,
        });
        const token = response.data.csrfToken;
        api.defaults.headers.common['X-CSRFToken'] = token;
        return token;
    } catch (error) {
        console.error('Ошибка получения CSRF:', error);
        return '';
    }
};

// Интерсептор для добавления CSRF токена в каждый запрос
api.interceptors.request.use(async (config) => {
    // Пропускаем запрос на получение CSRF, чтобы избежать цикла
    if (config.url?.includes('/csrf/')) {
        return config;
    }
    
    const token = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
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

export default api;