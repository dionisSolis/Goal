import React, { useState, useEffect } from 'react';
import { goalApi, authApi, getCSRFToken } from './services/api';
import { Goal } from './types';
import Statistics from './components/Statistics';
import Login from './components/Login';
import './App.css';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'goals' | 'stats'>('goals');
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        deadline: '',
        criterion: ''
    });
    const [newSubtask, setNewSubtask] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const init = async () => {
            try {
                await getCSRFToken();
                const response = await authApi.checkAuth();
                if (response.data.authenticated) {
                    setIsAuthenticated(true);
                    await loadGoals();
                } else {
                    setIsAuthenticated(false);
                }
            } catch {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const loadGoals = async () => {
        try {
            const response = await goalApi.getAll();
            setGoals(response.data);
        } catch (error) {
            console.error('Ошибка загрузки целей:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
            setIsAuthenticated(false);
            setGoals([]);
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
    };

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await goalApi.create(newGoal);
            setNewGoal({ title: '', description: '', deadline: '', criterion: '' });
            setShowForm(false);
            await loadGoals();
        } catch (error) {
            console.error('Ошибка создания цели:', error);
            alert('Ошибка создания цели. Проверьте консоль.');
        }
    };

    const handleAddSubtask = async (goalId: number) => {
    const title = newSubtask[goalId];
    if (!title?.trim()) return;

    try {
        // Убедимся, что CSRF токен есть
        await getCSRFToken();
        
        const response = await goalApi.addSubtask(goalId, title);
        console.log('Подзадача создана:', response.data);
        
        setNewSubtask({ ...newSubtask, [goalId]: '' });
        await loadGoals();
    } catch (error: any) {
        console.error('Ошибка добавления подзадачи:', error);
        console.error('Ответ сервера:', error.response?.data);
        alert(`Ошибка: ${error.response?.data?.title?.[0] || 'Не удалось добавить подзадачу'}`);
    }
};

    const handleCompleteSubtask = async (goalId: number, subtaskId: number) => {
    try {
        await getCSRFToken();
        await goalApi.completeSubtask(goalId, subtaskId);
        await loadGoals();
    } catch (error) {
        console.error('Ошибка выполнения подзадачи:', error);
    }
};

    const handleDeleteGoal = async (id: number) => {
        if (window.confirm('Удалить эту цель?')) {
            try {
                await goalApi.delete(id);
                await loadGoals();
            } catch (error) {
                console.error('Ошибка удаления цели:', error);
            }
        }
    };

    if (isAuthenticated === null || loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return <Login onLogin={async () => {
            await getCSRFToken();
            setIsAuthenticated(true);
            await loadGoals();
        }} />;
    }

    return (
        <div className="app">
            <header className="header">
                <h1>🎯 Goal Tracker</h1>
                <div className="header-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('goals')}
                    >
                        🎯 Мои цели
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        📊 Статистика
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {activeTab === 'goals' && (
                        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✖ Отмена' : '+ Новая цель'}
                        </button>
                    )}
                    <button className="btn-secondary" onClick={handleLogout}>
                        🚪 Выход
                    </button>
                </div>
            </header>

            {activeTab === 'stats' ? (
                <Statistics />
            ) : (
                <>
                    {showForm && (
                        <form className="goal-form" onSubmit={handleCreateGoal}>
                            <h2>Новая цель</h2>
                            <input
                                type="text"
                                placeholder="Название цели *"
                                value={newGoal.title}
                                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Описание"
                                value={newGoal.description || ''}
                                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                            />
                            <input
                                type="date"
                                placeholder="Срок выполнения"
                                value={newGoal.deadline || ''}
                                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Критерий достижения *"
                                value={newGoal.criterion}
                                onChange={(e) => setNewGoal({ ...newGoal, criterion: e.target.value })}
                                required
                            />
                            <button type="submit" className="btn-success">Создать цель</button>
                        </form>
                    )}

                    <div className="goals-grid">
                        {goals.map((goal) => (
                            <div key={goal.id} className="goal-card">
                                <div className="goal-header">
                                    <h3>{goal.title}</h3>
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDeleteGoal(goal.id)}
                                    >
                                        🗑
                                    </button>
                                </div>
                                
                                {goal.description && (
                                    <p className="goal-description">{goal.description}</p>
                                )}
                                
                                <div className="goal-meta">
                                    {goal.deadline && (
                                        <span className="deadline">
                                            📅 {new Date(goal.deadline).toLocaleDateString('ru-RU')}
                                        </span>
                                    )}
                                    <span className="criterion">
                                        🎯 {goal.criterion}
                                    </span>
                                </div>

                                <div className="progress-section">
                                    <div className="progress-label">
                                        <span>Прогресс</span>
                                        <span className="progress-value">{goal.progress_percent}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${goal.progress_percent}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="subtasks-section">
                                    <h4>Подзадачи</h4>
                                    <div className="subtasks-list">
                                        {goal.subtasks && goal.subtasks.map((subtask) => (
                                            <div key={subtask.id} className="subtask-item">
                                                <input
                                                    type="checkbox"
                                                    checked={subtask.is_completed}
                                                    onChange={() => handleCompleteSubtask(goal.id, subtask.id)}
                                                    disabled={subtask.is_completed}
                                                />
                                                <span className={subtask.is_completed ? 'completed' : ''}>
                                                    {subtask.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="add-subtask">
                                        <input
                                            type="text"
                                            placeholder="Новая подзадача"
                                            value={newSubtask[goal.id] || ''}
                                            onChange={(e) => setNewSubtask({ 
                                                ...newSubtask, 
                                                [goal.id]: e.target.value 
                                            })}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddSubtask(goal.id);
                                                }
                                            }}
                                        />
                                        <button onClick={() => handleAddSubtask(goal.id)}>+</button>
                                    </div>
                                </div>

                                <div className="goal-status">
                                    <span className={`status-badge status-${goal.status}`}>
                                        {goal.status === 'active' && 'Активна'}
                                        {goal.status === 'completed' && '✓ Завершена'}
                                        {goal.status === 'archived' && 'Архив'}
                                        {goal.status === 'failed' && 'Провалена'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {goals.length === 0 && !loading && (
                        <div className="empty-state">
                            <p>У вас пока нет целей</p>
                            <button className="btn-primary" onClick={() => setShowForm(true)}>
                                Создать первую цель
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default App;