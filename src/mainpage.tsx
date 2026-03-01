'use client';

import { useState, useEffect } from 'react';
import {
  Hand,
  Sun,
  CloudSun,
  Moon,
  Star,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import './mainpage.css';
import { Sidebar } from './components/Sidebar';
import { AnimatedPromptInput } from './components/AnimatedPromptInput';
import { supabase } from './lib/supabase';

interface GreetingType {
  text: string;
  icon: typeof Sun | typeof CloudSun | typeof Moon | typeof Star;
  subtitles: string[];
}

interface User {
  name: string;
  email: string;
}

const greetings: Record<string, GreetingType> = {
  morning: {
    text: 'Доброе утро',
    icon: Sun,
    subtitles: ['Готов к новым открытиям?', 'Начни день с чистого промпта!', 'Кофе есть? Отлично, за работу!']
  },
  afternoon: {
    text: 'Добрый день',
    icon: CloudSun,
    subtitles: ['Продолжаем в том же духе!', 'Время для новых идей?', 'Как насчёт продуктивного анализа?']
  },
  evening: {
    text: 'Добрый вечер',
    icon: Moon,
    subtitles: ['Завершаем день продуктивно?', 'Время для спокойного анализа', 'Последний промпт перед отдыхом?']
  },
  night: {
    text: 'Доброй ночи',
    icon: Star,
    subtitles: ['Ночные сессии — это мощно', 'Работаешь допоздна? Уважаю!', 'Тихий час для важных задач']
  }
};

const MainPage: React.FC = () => {
  const [metricsCollapsed, setMetricsCollapsed] = useState(false);
  const [greeting, setGreeting] = useState<GreetingType | null>(null);
  const [randomSubtitle, setRandomSubtitle] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    updateGreeting();
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser({
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || ''
      });
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    let period: string;

    if (hour >= 5 && hour < 12) period = 'morning';
    else if (hour >= 12 && hour < 18) period = 'afternoon';
    else if (hour >= 18 && hour < 23) period = 'evening';
    else period = 'night';

    const selectedGreeting = greetings[period];
    const randomSub = selectedGreeting.subtitles[Math.floor(Math.random() * selectedGreeting.subtitles.length)];

    setGreeting(selectedGreeting);
    setRandomSubtitle(randomSub);
  };

  const handleAnalyze = () => {
    if (!promptInput.trim()) return;
    console.log('Analyzing prompt:', promptInput);
    // Здесь будет логика анализа
  };

  const GreetingIcon = greeting?.icon || Hand;

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="grid-overlay"></div>

      <div className="dashboard">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="main">
          <div className="content-layout">
            {/* Левая колонка - Focus Area */}
            <div className="focus-column">
              <header className="header">
                <h1 className="greeting">
                  <span id="greeting-text">{greeting?.text || 'Добро пожаловать'}</span>, <span className="greeting-highlight">{user?.name || 'User'}</span>
                  <GreetingIcon className="greeting-icon" size={28} />
                </h1>
                <p className="subtitle">{randomSubtitle || 'Готов улучшать свои промпты?'}</p>
              </header>

              {/* Focus Area */}
              <div className="focus-area">
                <AnimatedPromptInput
                  onAnalyze={handleAnalyze}
                />
              </div>
            </div>

            {/* Правая колонка - Метрики */}
            <aside className={`metrics-column ${metricsCollapsed ? 'collapsed' : ''}`}>
              <div className="metrics-content">
                <div className="metrics-section">
                  <div className="section-header">
                    <h2 className="section-title">Статистика</h2>
                  </div>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10"/>
                          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                        </svg>
                        Средний Score
                      </div>
                      <div className="metric-value">82</div>
                      <div className="metric-trend trend-up">▲ +4 за неделю</div>
                      <div className="goal-progress">
                        <div className="goal-progress-fill" style={{ width: '82%' }}></div>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Запросов
                      </div>
                      <div className="metric-value">156</div>
                      <div className="metric-trend">+23 на неделе</div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="m12 14 4-4"/>
                          <path d="M3.34 19a10 10 0 1 1 17.32 0"/>
                        </svg>
                        Цель
                      </div>
                      <div className="metric-value">12/20</div>
                      <div className="metric-trend">Осталось 8</div>
                      <div className="goal-progress">
                        <div className="goal-progress-fill" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Requests */}
                <div className="metrics-section">
                  <div className="section-header">
                    <h2 className="section-title">Последние запросы</h2>
                    <a href="#" className="section-link">Все →</a>
                  </div>

                  <div className="requests-list">
                    {requests.map((request, index) => (
                      <div key={index} className="request-item">
                        <div className="request-info">
                          <span className="request-prompt">«{request.prompt}»</span>
                          <span className={`request-badge badge-${request.badgeType}`}>{request.score}</span>
                          <span className="request-issues">{request.issues}</span>
                        </div>
                        <span className="request-date">{request.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Кнопка управления метриками */}
            <button
              className="metrics-toggle"
              onClick={() => setMetricsCollapsed(!metricsCollapsed)}
              title={metricsCollapsed ? "Развернуть метрики" : "Свернуть метрики"}
            >
              {metricsCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

// Данные для последних запросов
const requests = [
  {
    prompt: 'Напиши функцию для загрузки пользователей',
    score: 26,
    badgeType: 'low',
    issues: '3 проблемы',
    date: '2 часа назад'
  },
  {
    prompt: 'React компонент формы с валидацией',
    score: 84,
    badgeType: 'high',
    issues: '1 проблема',
    date: 'вчера'
  },
  {
    prompt: 'API endpoint для авторизации',
    score: 58,
    badgeType: 'medium',
    issues: '5 проблем',
    date: '25 фев'
  },
  {
    prompt: 'Unit тесты для калькулятора',
    score: 92,
    badgeType: 'high',
    issues: '0 проблем',
    date: '24 фев'
  }
];

export default MainPage;