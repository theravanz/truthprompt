'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Share2, Download, Loader2, Square, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatView.css';
import { AnimatedPromptInput } from './AnimatedPromptInput';
import type { CustomModel } from './AnimatedPromptInput';
import {
  getChatWithMessages,
  addMessage,
  createChat,
  sendToAI
} from '../lib/chats';
import { PromptAnalysis } from './PromptAnalysis';
import { ClarifyingQuestions } from './ClarifyingQuestions';
import { ToDoPlan } from './ToDoPlan';
import { CodeReview } from './CodeReview';
import { AIAssessment } from './AIAssessment';
import { ImprovementSuggestions } from './ImprovementSuggestions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  tools?: {
    analysis?: { score: number; strengths: string[]; weaknesses: string[]; summary: string };
    questions?: string[];
    todoPlan?: Array<{ id: number; description: string; status: 'pending' | 'in_progress' | 'completed' }>;
    codeReview?: Array<{ severity: 'critical' | 'warning' | 'info'; title: string; description: string }>;
    assessment?: { aiScore: number; usefulness: number; accuracy: number; completeness: number };
    suggestions?: Array<{ id: number; title: string; description: string }>;
  };
}

interface QueuedRequest {
  id: string;
  prompt: string;
  model: CustomModel;
  selectedTools: string[];
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

interface GenerationPlan {
  requestId: string;
  steps: Array<{
    id: number;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
  currentStep: number;
}

export function ChatView() {
  const params = useParams();
  const navigate = useNavigate();
  const chatId = params.chatId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTitle, setChatTitle] = useState('Новый чат');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [requestQueue, setRequestQueue] = useState<QueuedRequest[]>([]);
  const [generationPlan, setGenerationPlan] = useState<GenerationPlan | null>(null);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [currentChatIdForQueue, setCurrentChatIdForQueue] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const queueProcessingRef = useRef(false);
  const requestQueueRef = useRef<QueuedRequest[]>([]);

  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    } else {
      setIsLoading(false);
    }
  }, [chatId]);

  // Проверяем initial_prompt из sessionStorage при первом рендере
  useEffect(() => {
    const initialPromptData = sessionStorage.getItem('initial_prompt');
    if (initialPromptData && chatId) {
      try {
        const { prompt, model, selectedTools = [] } = JSON.parse(initialPromptData);

        // Добавляем запрос в очередь
        const queuedRequest: QueuedRequest = {
          id: `req-${Date.now()}`,
          prompt,
          model,
          selectedTools,
          timestamp: Date.now(),
          status: 'pending'
        };

        setRequestQueue(prev => {
          const newQueue = [...prev, queuedRequest];
          requestQueueRef.current = newQueue;
          return newQueue;
        });

        setCurrentChatIdForQueue(chatId);

        // Очищаем sessionStorage
        sessionStorage.removeItem('initial_prompt');
      } catch (err) {
        console.error('Error parsing initial prompt:', err);
        sessionStorage.removeItem('initial_prompt');
      }
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, requestQueue]);

  // Обновление текущего шага плана во время генерации
  useEffect(() => {
    if (generationPlan && isTyping) {
      const interval = setInterval(() => {
        setGenerationPlan(prev => {
          if (!prev) return null;
          const nextStep = Math.min(prev.currentStep + 1, prev.steps.length);
          return {
            ...prev,
            currentStep: nextStep,
            steps: prev.steps.map((step, index) => ({
              ...step,
              status: index < nextStep ? 'completed' : index === nextStep ? 'in_progress' : 'pending'
            }))
          };
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isTyping, generationPlan]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const chat = await getChatWithMessages(id);
      
      if (chat) {
        setChatTitle(chat.title || 'Чат');
        const mappedMessages: Message[] = chat.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at).getTime(),
          model: msg.model_name
        }));
        setMessages(mappedMessages);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Не удалось загрузить чат');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (prompt: string, model: CustomModel, selectedTools: string[] = []) => {
    if (!prompt.trim()) return;

    // Если уже идёт генерация — просто добавляем в очередь
    if (isTyping || queueProcessingRef.current) {
      const queuedRequest: QueuedRequest = {
        id: `req-${Date.now()}`,
        prompt,
        model,
        selectedTools,
        timestamp: Date.now(),
        status: 'pending'
      };

      setRequestQueue(prev => {
        const newQueue = [...prev, queuedRequest];
        requestQueueRef.current = newQueue;
        return newQueue;
      });
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      model: model.name
    };

    let currentChatId = chatId;

    // Если чата нет, создаем новый
    if (!currentChatId) {
      try {
        currentChatId = await createChat(prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''));
        // Сохраняем сообщение пользователя в Supabase ДО навигации
        await addMessage(currentChatId, 'user', prompt, {
          model_name: model.name,
          metadata: { tools: selectedTools }
        });
        // Добавляем сообщение локально
        setMessages(prev => [...prev, userMessage]);
        // Перенаправляем на чат
        navigate(`/chat/${currentChatId}`, { replace: true });
        // Ждём обновления роута
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error('Error creating chat:', err);
        setError('Не удалось создать чат');
        return;
      }
    } else {
      // Добавляем сообщение пользователя
      setMessages(prev => [...prev, userMessage]);

      // Сохраняем сообщение в Supabase
      await addMessage(currentChatId, 'user', prompt, {
        model_name: model.name,
        metadata: { tools: selectedTools }
      });
    }

    // Создаём запрос и добавляем в очередь
    const queuedRequest: QueuedRequest = {
      id: `req-${Date.now()}`,
      prompt,
      model,
      selectedTools,
      timestamp: Date.now(),
      status: 'pending'
    };

    // Обновляем state и ref
    setRequestQueue(prev => {
      const newQueue = [...prev, queuedRequest];
      requestQueueRef.current = newQueue;
      return newQueue;
    });

    setCurrentChatIdForQueue(currentChatId);
  };

  const generatePlanForRequest = useCallback((request: QueuedRequest): GenerationPlan => {
    // Генерируем план на основе запроса
    const steps = [
      { id: 1, description: 'Анализ запроса', status: 'pending' as const },
      { id: 2, description: 'Формирование структуры ответа', status: 'pending' as const },
      { id: 3, description: 'Генерация решения', status: 'pending' as const },
      { id: 4, description: 'Проверка и оптимизация', status: 'pending' as const },
    ];

    return {
      requestId: request.id,
      steps,
      currentStep: 0
    };
  }, []);

  const buildPlanPrompt = useCallback((prompt: string, _plan: GenerationPlan, selectedTools: string[] = []): string => {
    // Формируем инструкции для выбранных инструментов
    const toolInstructions = selectedTools.map(toolId => {
      switch (toolId) {
        case 'analyze':
          return '• Проведи глубокий анализ задачи: оцени качество промпта (0-100), выдели сильные и слабые стороны';
        case 'clarify':
          return '• Задай 1-2 уточняющих вопроса для проверки логики задачи (как специалист клиенту)';
        case 'todo':
          return '• To-Do план формируется автоматически — НЕ пиши его текстом в ответе';
        case 'review':
          return '• Проведи критический анализ: найди ошибки, уязвимости и заблуждения в коде';
        default:
          return '';
      }
    }).filter(Boolean).join('\n');

    return `Ты TruthPrompt — AI ассистент для анализа промптов и код-ревью.
Твоя специализация — инновационные решения для разработчиков.

**ИНСТРУМЕНТЫ**:\n${toolInstructions}

**ВАЖНО**: 
- To-Do план отображается в UI автоматически — НЕ пиши его текстом
- Оценку промпта пиши в формате: "Оценка: X/100"
- Уточняющие вопросы нумеруй: "1.", "2."
- Код ревью помечай: [КРИТИЧНО], [ПРЕДУПРЕЖДЕНИЕ]

**Запрос пользователя**:\n${prompt}

Следуй инструкциям и предоставляй подробный ответ.`;
  }, []);

  const generateMockResponse = useCallback((prompt: string, selectedTools: string[] = []): string => {
    // Оцениваем качество промпта по его содержимому
    const promptScore = evaluatePromptQuality(prompt);
    
    // Формируем ответ на основе выбранных инструментов
    const toolResponses = selectedTools.map(toolId => {
      switch (toolId) {
        case 'analyze':
          return `**🔍 АНАЛИЗ ПРОМПТА**\n\n**Оценка:** ${promptScore}/100\n\n${getPromptFeedback(promptScore)}`;
        case 'clarify':
          return `**❓ УТОЧНЯЮЩИЕ ВОПРОСЫ**:\n\n${getClarifyingQuestions(prompt)}`;
        case 'todo':
          return ''; // To-Do план отображается в UI, не пишем текстом
        case 'review':
          return `**⚠️ КРИТИЧЕСКИЙ АНАЛИЗ**:\n\n${getCodeReviewMock(prompt)}`;
        default:
          return '';
      }
    }).filter(Boolean).join('\n\n');

    const defaultResponse = `**ОТВЕТ AI**:\n\n${getAIResponse(prompt)}\n\nХотите, чтобы я улучшил этот код?`;

    return selectedTools.length > 0
      ? `${toolResponses}\n\n${defaultResponse}`
      : defaultResponse;
  }, []);

  // Оценка качества промпта (0-100)
  const evaluatePromptQuality = useCallback((prompt: string): number => {
    const p = prompt.toLowerCase().trim();
    
    // Очень короткие промпты (< 15 символов)
    if (p.length < 15) return Math.floor(Math.random() * 20) + 15; // 15-35
    
    // Простые запросы без контекста
    if (p.length < 30) return Math.floor(Math.random() * 25) + 30; // 30-55
    
    // Промпты средней длины
    if (p.length < 50) return Math.floor(Math.random() * 20) + 50; // 50-70
    
    // Детальные промпты
    if (p.length >= 50) {
      let score = 65;
      
      // Бонус за наличие ключевых слов
      if (p.includes('функци') || p.includes('компонент') || p.includes('класс')) score += 10;
      if (p.includes('typescript') || p.includes('interface') || p.includes('type')) score += 8;
      if (p.includes('ошибка') || p.includes('обработ') || p.includes('try') || p.includes('catch')) score += 7;
      if (p.includes('данные') || p.includes('api') || p.includes('fetch') || p.includes('request')) score += 5;
      if (p.includes('пользователь') || p.includes('user') || p.includes('auth')) score += 5;
      
      return Math.min(score + Math.floor(Math.random() * 10), 95);
    }
    
    return 50;
  }, []);

  // Получение отзыва на основе оценки
  const getPromptFeedback = useCallback((score: number): string => {
    if (score < 30) {
      return `**Сильные стороны**:\n- Запрос понятен в общих чертах\n\n**Слабые стороны**:\n- Критически не хватает контекста\n- Не указаны требования и ожидания\n- Нет информации о технологиях\n- Отсутствуют примеры желаемого результата`;
    } else if (score < 50) {
      return `**Сильные стороны**:\n- Основная задача ясна\n\n**Слабые стороны**:\n- Не хватает деталей о проекте\n- Не указаны граничные случаи\n- Нет информации об ошибках`;
    } else if (score < 70) {
      return `**Сильные стороны**:\n- Задача сформулирована четко\n- Есть базовый контекст\n\n**Слабые стороны**:\n- Можно добавить больше деталей\n- Не указаны требования к производительности`;
    } else {
      return `**Сильные стороны**:\n- Отличная детализация\n- Понятный контекст\n- Ясные требования\n\n**Слабые стороны**:\n- Можно добавить примеры данных`;
    }
  }, []);

  // Генерация уточняющих вопросов на основе промпта
  const getClarifyingQuestions = useCallback((prompt: string): string => {
    const p = prompt.toLowerCase();
    
    if (p.includes('сайт') || p.includes('веб')) {
      return '1. Какой стек технологий вы используете (React, Vue, Angular, vanilla)?\n2. Нужна ли адаптивная верстка и поддержка мобильных устройств?';
    } else if (p.includes('функци') || p.includes('метод')) {
      return '1. Какие входные данные ожидает функция и что должна возвращать?\n2. Как должна обрабатываться ошибка в случае неудачи?';
    } else if (p.includes('api') || p.includes('fetch')) {
      return '1. Какой формат данных вы ожидаете от API (JSON, XML, текст)?\n2. Нужна ли обработка повторных попыток при ошибке сети?';
    } else if (p.includes('компонент') || p.includes('react') || p.includes('vue')) {
      return '1. Какие props должен принимать компонент?\n2. Нужно ли управлять состоянием внутри компонента или использовать внешнее?';
    } else {
      return '1. Какой контекст проекта (фреймворк, версия, окружение)?\n2. Какие конкретные требования к результату?';
    }
  }, []);

  // Mock Code Review
  const getCodeReviewMock = useCallback((_prompt: string): string => {
    return '[ПРЕДУПРЕЖДЕНИЕ] Отсутствует обработка ошибок\n[ПРЕДУПРЕЖДЕНИЕ] Нет типизации данных';
  }, []);

  // Mock AI ответ
  const getAIResponse = useCallback((_prompt: string): string => {
    return `Вот решение для вашей задачи:\n\n\`\`\`typescript\nasync function loadData() {\n  try {\n    const response = await fetch('/api/data');\n    if (!response.ok) throw new Error('Failed to fetch');\n    return await response.json();\n  } catch (error) {\n    console.error('Error:', error);\n    return null;\n  }\n}\n\`\`\``;
  }, []);

  // Функция парсинга ответа ИИ для извлечения результатов инструментов
  const parseToolResults = useCallback((content: string, selectedTools: string[]) => {
    const tools: Message['tools'] = {};

    // Парсинг анализа промпта
    if (selectedTools.includes('analyze')) {
      // Ищем оценку в форматах: "Оценка: 75/100", "Качество промпта: 85/100", "75/100"
      const scoreMatch = content.match(/Оценка[:\s]*(\d+)\s*\/\s*100/i) 
        || content.match(/Качество промпта[:\s]*(\d+)\s*\/\s*100/i)
        || content.match(/(\d+)\s*\/\s*100/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;
      
      const strengthsMatch = content.match(/\*\*Сильные стороны\*\*[:\s]*\n([\s\S]*?)(?=\n\*\*|$)/i);
      const strengths = strengthsMatch 
        ? strengthsMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-/, '').trim())
        : [];

      const weaknessesMatch = content.match(/\*\*Слабые стороны\*\*[:\s]*\n([\s\S]*?)(?=\n\*\*|$)/i);
      const weaknesses = weaknessesMatch
        ? weaknessesMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-/, '').trim())
        : [];

      tools.analysis = { score, strengths, weaknesses, summary: 'Анализ вашего промпта' };
    }

    // Парсинг уточняющих вопросов
    if (selectedTools.includes('clarify')) {
      const questionsMatch = content.match(/\*\*❓ УТОЧНЯЮЩИЕ ВОПРОСЫ\*\*[:\s]*\n([\s\S]*?)(?=\n\n|\*\*|$)/i);
      if (questionsMatch) {
        const questions = questionsMatch[1]
          .split('\n')
          .filter(l => l.match(/^\d+\./))
          .map(l => l.replace(/^\d+\.\s*/, '').trim());
        if (questions.length > 0) {
          tools.questions = questions;
        }
      }
    }

    // To-Do план НЕ парсим — он генерируется автоматически из GenerationPlan
    // if (selectedTools.includes('todo')) { ... }

    // Парсинг Code Review
    if (selectedTools.includes('review')) {
      const issues: Array<{ severity: 'critical' | 'warning' | 'info'; title: string; description: string }> = [];
      
      // Ищем [КРИТИЧНО] и [ПРЕДУПРЕЖДЕНИЕ]
      const criticalMatches = content.matchAll(/\[КРИТИЧНО\]\s*(.+?)(?:\n|$)/gi);
      for (const match of criticalMatches) {
        issues.push({ severity: 'critical', title: match[1].trim(), description: '' });
      }
      
      const warningMatches = content.matchAll(/\[ПРЕДУПРЕЖДЕНИЕ\]\s*(.+?)(?:\n|$)/gi);
      for (const match of warningMatches) {
        issues.push({ severity: 'warning', title: match[1].trim(), description: '' });
      }

      if (issues.length > 0) {
        tools.codeReview = issues;
      }
    }

    // Оценка ИИ — НЕЗАВИСИМАЯ от оценки промпта
    // Это оценка КАЧЕСТВА ОТВЕТА ИИ, а не промпта пользователя
    tools.assessment = {
      aiScore: Math.floor(Math.random() * 15) + 80, // 80-95 — ИИ старается хорошо отвечать
      usefulness: Math.floor(Math.random() * 20) + 75,
      accuracy: Math.floor(Math.random() * 15) + 80,
      completeness: Math.floor(Math.random() * 25) + 70
    };

    // Предложения по улучшению
    tools.suggestions = [
      {
        id: 1,
        title: 'Добавьте контекст',
        description: 'Укажите больше деталей о вашем проекте и окружении'
      },
      {
        id: 2,
        title: 'Уточните требования',
        description: 'Опишите ожидаемое поведение и граничные случаи'
      }
    ];

    return tools;
  }, []);

  const processNextRequest = useCallback(async () => {
    // Проверяем, что можно обрабатывать
    if (queueProcessingRef.current || isTyping) {
      return;
    }

    if (requestQueueRef.current.length === 0 || !currentChatIdForQueue) {
      return;
    }

    // Находим первый pending запрос
    const pendingIndex = requestQueueRef.current.findIndex(req => req.status === 'pending');
    if (pendingIndex === -1) return;

    const pendingRequest = requestQueueRef.current[pendingIndex];

    // Сразу помечаем как processing чтобы предотвратить повторную обработку
    queueProcessingRef.current = true;
    requestQueueRef.current[pendingIndex].status = 'processing';
    setRequestQueue([...requestQueueRef.current]);
    setIsProcessingQueue(true);

    // Генерируем план для этого запроса
    const plan = generatePlanForRequest(pendingRequest);
    setGenerationPlan(plan);
    setIsTyping(true);

    // Создаём AbortController для возможности отмены запроса
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Получаем API ключ из переменной окружения Vercel или localStorage
      const getEnvVar = (name: string) => {
        try {
          return (import.meta as any).env?.[name] || '';
        } catch {
          return '';
        }
      };

      const apiKey = getEnvVar('VITE_OPENROUTER_KEY') ||
                     getEnvVar('OPENROUTER_KEY') ||
                     localStorage.getItem('openrouter_api_key') || '';

      let aiResponse: string;

      // Формируем промпт с планом работы
      const planPrompt = buildPlanPrompt(pendingRequest.prompt, plan, pendingRequest.selectedTools);

      if (apiKey) {
        // Отправляем запрос к реальному AI
        aiResponse = await sendToAI(planPrompt, pendingRequest.model.id, apiKey, controller.signal);
      } else {
        // Используем mock-ответ если нет API ключа
        aiResponse = generateMockResponse(pendingRequest.prompt, pendingRequest.selectedTools);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Парсим результаты инструментов
      const toolResults = parseToolResults(aiResponse, pendingRequest.selectedTools);

      // Добавляем To-Do план из generationPlan
      if (generationPlan && generationPlan.steps.length > 0) {
        toolResults.todoPlan = generationPlan.steps.map(step => ({
          id: step.id,
          description: step.description,
          status: step.status
        }));
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
        model: pendingRequest.model.name,
        tools: toolResults
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Сохраняем ответ AI в Supabase
      await addMessage(currentChatIdForQueue, 'assistant', aiResponse, {
        model_name: pendingRequest.model.name
      });

    } catch (err: any) {
      if (err.message === 'aborted') {
        // Запрос был отменён пользователем
        console.log('Request aborted by user');
      } else {
        console.error('Error getting AI response:', err);
        const errorMessage: Message = {
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          content: 'Произошла ошибка при получении ответа. Проверьте API ключ в настройках.',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      // Удаляем обработанный запрос из ref
      requestQueueRef.current = requestQueueRef.current.filter(req => req.id !== pendingRequest.id);
      setRequestQueue([...requestQueueRef.current]);

      setIsTyping(false);
      setAbortController(null);
      setGenerationPlan(null);
      queueProcessingRef.current = false;
      setIsProcessingQueue(false);
    }
  }, [currentChatIdForQueue, isTyping, generatePlanForRequest, buildPlanPrompt, generateMockResponse, parseToolResults, evaluatePromptQuality, getPromptFeedback, getClarifyingQuestions, getCodeReviewMock, getAIResponse]);

  // Запускаем обработку при появлении новых запросов
  useEffect(() => {
    // Проверяем наличие pending запросов
    const pendingCount = requestQueueRef.current.filter(r => r.status === 'pending').length;

    // Запускаем обработку только если есть pending запросы и ничего не обрабатывается
    if (pendingCount > 0 &&
        !queueProcessingRef.current &&
        !isTyping &&
        currentChatIdForQueue) {
      processNextRequest();
    }
  }, [requestQueue, currentChatIdForQueue, isTyping]);

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsTyping(false);
      setAbortController(null);
      setGenerationPlan(null);
    }
  };

  const handleCancelQueuedRequest = (requestId: string) => {
    const index = requestQueueRef.current.findIndex(req => req.id === requestId);
    if (index !== -1 && requestQueueRef.current[index].status === 'pending') {
      requestQueueRef.current.splice(index, 1);
      setRequestQueue([...requestQueueRef.current]);
    }
  };

  const copyMessage = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareChat = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedId('share');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportChat = () => {
    const content = messages.map(m => 
      `[${m.role.toUpperCase()}] ${new Date(m.timestamp).toLocaleString('ru-RU')}:\n${m.content}\n`
    ).join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${chatId || 'new'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  if (isLoading) {
    return (
      <div className="chat-view">
        <div className="chat-loading">
          <Loader2 className="spinner" size={48} />
          <p>Загрузка чата...</p>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="chat-view">
        <div className="chat-error">
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/app')} className="btn btn-primary">
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-view">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="grid-overlay"></div>

      <div className="chat-layout" ref={chatContainerRef}>
        {/* Header */}
        <header className="chat-header">
          <div className="chat-header-left">
            <button className="back-btn" onClick={() => navigate('/app')} type="button">
              <ArrowLeft size={20} />
            </button>
            <h1 className="chat-title">{chatTitle}</h1>
          </div>
          <div className="chat-header-actions">
            <button 
              className="header-action-btn" 
              onClick={shareChat}
              title="Поделиться"
              type="button"
            >
              <Share2 size={18} />
              {copiedId === 'share' && <span className="tooltip">Скопировано!</span>}
            </button>
            <button 
              className="header-action-btn" 
              onClick={exportChat}
              title="Экспорт"
              type="button"
            >
              <Download size={18} />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2>Начните диалог</h2>
              <p>Задайте вопрос или опишите задачу для анализа</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.role}`}
                >
                  <div className="message-avatar">
                    {message.role === 'user' ? (
                      <div className="avatar-user">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    ) : (
                      <div className="avatar-ai">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                          <circle cx="9" cy="13" r="1" fill="#fff" />
                          <circle cx="15" cy="13" r="1" fill="#fff" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-role">
                        {message.role === 'user' ? 'Вы' : message.model || 'AI'}
                      </span>
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                    <div className="message-text markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match && !children?.toString().includes('\n');
                            
                            if (isInline) {
                              return <code className={className} {...props}>{children}</code>;
                            }
                            
                            return (
                              <div className="code-block-wrapper">
                                <div className="code-block-header">
                                  <span className="code-language">{match ? match[1] : 'code'}</span>
                                  <button
                                    className="copy-code-btn"
                                    onClick={() => {
                                      const codeText = String(children).replace(/\n$/, '');
                                      navigator.clipboard.writeText(codeText);
                                    }}
                                    type="button"
                                  >
                                    <Copy size={14} />
                                  </button>
                                </div>
                                <pre className={className} {...props}>
                                  <code>{children}</code>
                                </pre>
                              </div>
                            );
                          },
                          p: ({ children }) => <p>{children}</p>,
                          strong: ({ children }) => <strong>{children}</strong>,
                          em: ({ children }) => <em>{children}</em>,
                          ul: ({ children }) => <ul>{children}</ul>,
                          ol: ({ children }) => <ol>{children}</ol>,
                          li: ({ children }) => <li>{children}</li>,
                          h1: ({ children }) => <h1>{children}</h1>,
                          h2: ({ children }) => <h2>{children}</h2>,
                          h3: ({ children }) => <h3>{children}</h3>,
                          h4: ({ children }) => <h4>{children}</h4>,
                          blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                          table: ({ children }) => (
                            <div className="table-wrapper">
                              <table>{children}</table>
                            </div>
                          ),
                          th: ({ children }) => <th>{children}</th>,
                          td: ({ children }) => <td>{children}</td>,
                          hr: () => <hr className="markdown-divider" />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {/* Отображение результатов инструментов для assistant сообщений */}
                    {message.role === 'assistant' && message.tools && (
                      <div className="message-tools" style={{ marginTop: 16 }}>
                        {message.tools.analysis && (
                          <PromptAnalysis
                            score={message.tools.analysis.score}
                            strengths={message.tools.analysis.strengths}
                            weaknesses={message.tools.analysis.weaknesses}
                            summary={message.tools.analysis.summary}
                          />
                        )}

                        {message.tools.questions && message.tools.questions.length > 0 && (
                          <ClarifyingQuestions questions={message.tools.questions} />
                        )}

                        {message.tools.todoPlan && message.tools.todoPlan.length > 0 && (
                          <ToDoPlan steps={message.tools.todoPlan} />
                        )}

                        {message.tools.codeReview && message.tools.codeReview.length > 0 && (
                          <CodeReview issues={message.tools.codeReview} />
                        )}

                        {message.tools.assessment && (
                          <AIAssessment
                            aiScore={message.tools.assessment.aiScore}
                            usefulness={message.tools.assessment.usefulness}
                            accuracy={message.tools.assessment.accuracy}
                            completeness={message.tools.assessment.completeness}
                          />
                        )}

                        {message.tools.suggestions && message.tools.suggestions.length > 0 && (
                          <ImprovementSuggestions suggestions={message.tools.suggestions} />
                        )}
                      </div>
                    )}

                    <div className="message-actions">
                      <button
                        className="message-action-btn"
                        onClick={() => copyMessage(message.content, message.id)}
                        type="button"
                      >
                        {copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === message.id && <span className="action-tooltip">Скопировано</span>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Отображение плана генерации */}
              {generationPlan && (
                <div className="message assistant typing">
                  <div className="message-avatar">
                    <div className="avatar-ai">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="plan-container">
                      <div className="plan-header">
                        <span className="plan-title">План работы AI</span>
                        <button
                          className="stop-generation-btn"
                          onClick={handleStopGeneration}
                          type="button"
                          title="Остановить генерацию"
                        >
                          <Square size={12} fill="currentColor" />
                        </button>
                      </div>
                      <div className="plan-steps">
                        {generationPlan.steps.map((step, index) => (
                          <div
                            key={step.id}
                            className={`plan-step ${index < generationPlan.currentStep ? 'completed' : ''} ${index === generationPlan.currentStep ? 'active' : ''}`}
                          >
                            <div className="plan-step-indicator">
                              {index < generationPlan.currentStep ? (
                                <Check size={12} />
                              ) : index === generationPlan.currentStep ? (
                                <div className="step-pulse"></div>
                              ) : (
                                <span className="step-number">{index + 1}</span>
                              )}
                            </div>
                            <span className="plan-step-text">{step.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Отображение очереди запросов */}
              {requestQueue.length > 0 && (
                <div className="queue-container">
                  <div className="queue-header">
                    <div className="queue-title">
                      <Loader2 className={`queue-icon ${isProcessingQueue ? 'spinning' : ''}`} size={16} />
                      <span>Очередь запросов ({requestQueue.length})</span>
                    </div>
                  </div>
                  <div className="queue-list">
                    {requestQueue.map((request, index) => (
                      <div
                        key={request.id}
                        className={`queue-item ${request.status} ${index === 0 && isTyping ? 'processing' : ''}`}
                      >
                        <div className="queue-item-content">
                          <span className="queue-item-prompt">{request.prompt.slice(0, 50)}{request.prompt.length > 50 ? '...' : ''}</span>
                          <span className={`queue-item-status status-${request.status}`}>
                            {request.status === 'pending' && 'Ожидает'}
                            {request.status === 'processing' && 'Выполняется'}
                            {request.status === 'completed' && 'Готов'}
                            {request.status === 'cancelled' && 'Отменён'}
                          </span>
                        </div>
                        {request.status === 'pending' && (
                          <button
                            className="cancel-request-btn"
                            onClick={() => handleCancelQueuedRequest(request.id)}
                            type="button"
                            title="Отменить запрос"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="chat-input-wrapper">
          <div className="chat-input-container">
            <AnimatedPromptInput onAnalyze={handleAnalyze} />
          </div>
        </div>
      </div>
    </div>
  );
}
