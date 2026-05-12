import React, { useState, useEffect } from 'react';
import { goalApi } from '../services/api';
import { Goal } from '../types';

const Statistics: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalApi.getAll();
      setGoals(response.data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  // Сначала получаем массивы
  const activeGoalsArray = goals.filter(g => g.status === 'active');
  const completedGoalsArray = goals.filter(g => g.status === 'completed');
  const failedGoalsArray = goals.filter(g => g.status === 'failed');
  
  // Потом считаем количество
  const totalGoals = goals.length;
  const completedGoals = completedGoalsArray.length;
  const activeGoals = activeGoalsArray.length;
  const failedGoals = failedGoalsArray.length;
  
  // Средний прогресс
  const avgProgress = activeGoalsArray.length > 0
    ? Math.round(activeGoalsArray.reduce((sum, g) => sum + g.progress_percent, 0) / activeGoalsArray.length)
    : 0;

  // Топ целей по прогрессу
  const topGoals = [...activeGoalsArray]
    .sort((a, b) => b.progress_percent - a.progress_percent)
    .slice(0, 5);

  // Недавно завершённые цели
  const recentCompleted = [...completedGoalsArray]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  // Просроченные цели
  const today = new Date();
  const overdueGoals = activeGoalsArray.filter(g => 
    g.deadline && new Date(g.deadline) < today
  );

  // Успешность
  const successRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  if (loading) return <div className="loading-stats">Загрузка статистики...</div>;

  // Функция склонения
  const getDeclension = (num: number, one: string, two: string, five: string): string => {
    const n = Math.abs(num) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return five;
    if (n1 > 1 && n1 < 5) return two;
    if (n1 === 1) return one;
    return five;
  };

  return (
    <div className="statistics">
      <h2>📊 Статистика достижений</h2>
      
      {/* Карточки с метриками */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{totalGoals}</div>
          <div className="stat-label">Всего целей</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{completedGoals}</div>
          <div className="stat-label">✅ Завершено</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{activeGoals}</div>
          <div className="stat-label">🔄 В процессе</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">{avgProgress}%</div>
          <div className="stat-label">Средний прогресс</div>
        </div>
      </div>

      {/* Дополнительные карточки */}
      <div className="stats-cards">
        <div className="stat-card danger">
          <div className="stat-value">{failedGoals}</div>
          <div className="stat-label">❌ Провалено</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overdueGoals.length}</div>
          <div className="stat-label">⚠️ Просрочено</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{successRate}%</div>
          <div className="stat-label">Успешность</div>
        </div>
      </div>

      {/* Топ целей по прогрессу */}
      <div className="info-card">
        <h3>🏆 Лучший прогресс</h3>
        {topGoals.length > 0 ? (
          <div className="top-goals-list">
            {topGoals.map((goal) => (
              <div key={goal.id} className="top-goal-item">
                <span className="top-goal-title">{goal.title}</span>
                <div className="top-goal-progress">
                  <div className="mini-progress-bar">
                    <div 
                      className="mini-progress-fill" 
                      style={{ width: `${goal.progress_percent}%` }}
                    />
                  </div>
                  <span className="top-goal-percent">{goal.progress_percent}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Нет активных целей</p>
        )}
      </div>

      {/* Недавние достижения */}
      <div className="info-card">
        <h3>🎉 Недавние достижения</h3>
        {recentCompleted.length > 0 ? (
          <div className="achievements-list">
            {recentCompleted.map((goal) => (
              <div key={goal.id} className="achievement-item">
                <span className="achievement-title">✓ {goal.title}</span>
                <span className="achievement-date">
                  {new Date(goal.updated_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Пока нет завершённых целей</p>
        )}
      </div>

      {/* Мотивационная цитата дня */}
      <div className="motivation-card">
        <p className="quote">
          {completedGoals > 0 
            ? `🎯 Вы уже достигли ${completedGoals} ${getDeclension(completedGoals, 'цели', 'целей', 'целей')}! Отличная работа!`
            : '"Маленькие шаги каждый день ведут к большим результатам."'}
        </p>
        <p className="quote-author">— Goal Tracker</p>
      </div>
    </div>
  );
};

export default Statistics;