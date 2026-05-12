import React, { useState } from 'react';
import { authApi } from '../services/api';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authApi.login(username, password);
            onLogin();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Неверное имя пользователя или пароль');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (username.length < 3) {
            setError('Имя пользователя должно быть не менее 3 символов');
            setLoading(false);
            return;
        }

        if (password !== password2) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }

        if (password.length < 4) {
            setError('Пароль должен быть не менее 4 символов');
            setLoading(false);
            return;
        }

        try {
            await authApi.register(username, email, password);
            // Автоматический вход после регистрации
            await authApi.login(username, password);
            onLogin();
        } catch (err: any) {
            if (err.response?.data?.username) {
                setError(`Имя пользователя: ${err.response.data.username[0]}`);
            } else {
                setError(err.response?.data?.error || 'Ошибка регистрации');
            }
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

                <div className="login-tabs">
                    <button 
                        className={`login-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => {
                            setIsLogin(true);
                            setError('');
                        }}
                    >
                        Вход
                    </button>
                    <button 
                        className={`login-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => {
                            setIsLogin(false);
                            setError('');
                        }}
                    >
                        Регистрация
                    </button>
                </div>

                <form onSubmit={isLogin ? handleLogin : handleRegister}>
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    
                    {!isLogin && (
                        <input
                            type="email"
                            placeholder="Email (необязательно)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    )}
                    
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {!isLogin && (
                        <input
                            type="password"
                            placeholder="Подтверждение пароля"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            required
                        />
                    )}

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;