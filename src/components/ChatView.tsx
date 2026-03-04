'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Trash2, Share2, Download } from 'lucide-react';
import './ChatView.css';
import { AnimatedPromptInput } from './AnimatedPromptInput';
import type { CustomModel } from './AnimatedPromptInput';
import { useTransition } from '../contexts/TransitionContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
}

interface ChatData {
  id: string;
  messages: Message[];
  createdAt: number;
  title: string;
}

export function ChatView() {
  const params = useParams();
  const navigate = useNavigate();
  const chatId = params.chatId;
  const { transitionData, endTransition } = useTransition();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTitle, setChatTitle] = useState('Новый чат');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    }
    
    // Если есть данные перехода, используем их
    if (transitionData && transitionData.chatId === chatId) {
      const initialMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: transitionData.prompt,
        timestamp: Date.now(),
        model: transitionData.model
      };
      setMessages([initialMessage]);
      endTransition();
    }
  }, [chatId, transitionData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = (id: string) => {
    const savedChats = localStorage.getItem('truthprompt_chats');
    if (savedChats) {
      const chats: ChatData[] = JSON.parse(savedChats);
      const chat = chats.find(c => c.id === id);
      if (chat) {
        setMessages(chat.messages);
        setChatTitle(chat.title || 'Чат');
      }
    }
  };

  const saveChat = (updatedMessages: Message[]) => {
    if (!chatId) return;
    
    const savedChats = localStorage.getItem('truthprompt_chats');
    const chats: ChatData[] = savedChats ? JSON.parse(savedChats) : [];
    
    const firstMessage = updatedMessages[0]?.content.slice(0, 50) || 'Новый чат';
    const title = firstMessage.length > 50 ? firstMessage + '...' : firstMessage;
    
    const chatIndex = chats.findIndex(c => c.id === chatId);
    const chatData: ChatData = {
      id: chatId,
      messages: updatedMessages,
      createdAt: Date.now(),
      title
    };

    if (chatIndex >= 0) {
      chats[chatIndex] = chatData;
    } else {
      chats.push(chatData);
    }

    localStorage.setItem('truthprompt_chats', JSON.stringify(chats));
    setChatTitle(title);
  };

  const handleAnalyze = async (prompt: string, model: CustomModel) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      model: model.name
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    if (!chatId) {
      const newChatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      navigate(`/chat/${newChatId}`, { replace: true });
      
      setTimeout(() => {
        saveChatToId(newChatId, updatedMessages);
      }, 100);
    } else {
      saveChat(updatedMessages);
    }

    setIsTyping(true);

    // Имитация ответа AI (здесь будет реальный API вызов)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: generateMockResponse(prompt),
        timestamp: Date.now(),
        model: model.name
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      setIsTyping(false);
      
      if (chatId) {
        saveChat(finalMessages);
      }
    }, 1500);
  };

  const saveChatToId = (id: string, updatedMessages: Message[]) => {
    const savedChats = localStorage.getItem('truthprompt_chats');
    const chats: ChatData[] = savedChats ? JSON.parse(savedChats) : [];
    
    const firstMessage = updatedMessages[0]?.content.slice(0, 50) || 'Новый чат';
    const title = firstMessage.length > 50 ? firstMessage + '...' : firstMessage;
    
    chats.push({
      id,
      messages: updatedMessages,
      createdAt: Date.now(),
      title
    });

    localStorage.setItem('truthprompt_chats', JSON.stringify(chats));
    setChatTitle(title);
  };

  const generateMockResponse = (_prompt: string): string => {
    const responses = [
      `Отличный запрос! Вот анализ вашего промпта:\n\n**Качество промпта:** 85/100\n\n**Сильные стороны:**\n- Четко сформулирована задача\n- Указан ожидаемый результат\n\n**Рекомендации:**\n- Добавьте информацию об обработке ошибок\n- Укажите требования к производительности\n\n**Пример кода:**\n\`\`\`typescript\nasync function loadData() {\n  try {\n    const response = await fetch('/api/data');\n    if (!response.ok) throw new Error('Failed to fetch');\n    return await response.json();\n  } catch (error) {\n    console.error('Error:', error);\n    return null;\n  }\n}\n\`\`\`\n\nХотите, чтобы я улучшил этот код?`,
      
      `Проанализировав ваш запрос, я предлагаю следующее решение:\n\n**Score:** 78/100\n\n**Проблемы:**\n1. Отсутствует обработка краевых случаев\n2. Нет типизации возвращаемого значения\n\n**Улучшенная версия:**\n\`\`\`typescript\ninterface UserData {\n  id: string;\n  name: string;\n  email: string;\n}\n\nconst fetchUsers = async (): Promise<UserData[]> => {\n  const res = await fetch('/api/users');\n  if (!res.ok) throw new Error('Network error');\n  return res.json();\n};\n\`\`\`\n\nЧто доработаем?`,
      
      `Интересная задача! Вот мой анализ:\n\n**Оценка:** 92/100 ⭐\n\n**Что хорошо:**\n✅ Ясная формулировка\n✅ Контекст задачи понятен\n\n**Код решения:**\n\`\`\`react\nfunction UserList({ users }: { users: User[] }) {\n  return (\n    <ul className="user-list">\n      {users.map(user => (\n        <li key={user.id}>\n          {user.name}\n        </li>\n      ))}\n    </ul>\n  );\n}\n\`\`\`\n\nНужны ли дополнительные объяснения?`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const copyMessage = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteMessage = (id: string) => {
    const updatedMessages = messages.filter(m => m.id !== id);
    setMessages(updatedMessages);
    if (chatId) {
      saveChat(updatedMessages);
    }
  };

  const shareChat = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedId('share');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportChat = () => {
    const content = messages.map(m => 
      `[${m.role.toUpperCase()}] ${m.timestamp}:\n${m.content}\n`
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
                    <div className="message-text">
                      {message.content.split('\n').map((line, i) => {
                        if (line.startsWith('```')) {
                          return null;
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <strong key={i}>{line.slice(2, -2)}</strong>;
                        }
                        if (line.startsWith('- ') || line.startsWith('✅') || line.startsWith('1.') || line.startsWith('2.')) {
                          return <div key={i} className="message-list-item">{line}</div>;
                        }
                        if (line.trim()) {
                          return <p key={i}>{line}</p>;
                        }
                        return <br key={i} />;
                      })}
                    </div>
                    <div className="message-actions">
                      <button
                        className="message-action-btn"
                        onClick={() => copyMessage(message.content, message.id)}
                        type="button"
                      >
                        {copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === message.id && <span className="action-tooltip">Скопировано</span>}
                      </button>
                      {message.role === 'user' && (
                        <button
                          className="message-action-btn"
                          onClick={() => deleteMessage(message.id)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="message assistant typing">
                  <div className="message-avatar">
                    <div className="avatar-ai">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
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
