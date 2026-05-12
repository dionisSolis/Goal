import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Функция для получения CSRF токена
    const getCSRFToken = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/csrf/', {
                withCredentials: true,
            });
            axios.defaults.headers.common['X-CSRFToken'] = response.data.csrfToken;
            return response.data.csrfToken;
        } catch (error) {
            console.error('Ошибка получения CSRF:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Получаем CSRF токен
            await getCSRFToken();
            
            // Логин
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            
            await axios.post('http://localhost:8000/api/login/', {
                username,
                password
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            onLogin();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка авторизации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>🎯 Goal Tracker</h1>
                    <p>Система достижения индивидуальных целей</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>

                <div className="login-demo">
                    <p>Создайте пользователя в админке:</p>
                    <code>http://localhost:8000/admin</code>
                </div>
            </div>
        </div>
    );
};

export default Login;