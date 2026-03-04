'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Trash2, Clock, ChevronRight, Loader2, Search } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { getUserChats, deleteChat, type Chat } from '../lib/chats';
import './ChatHistory.css';

export default function ChatHistory() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userChats = await getUserChats();
      setChats(userChats);
    } catch (err) {
      console.error('Error loading chats:', err);
      setError('Не удалось загрузить историю чатов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Вы уверены, что хотите удалить этот чат?')) return;

    try {
      setDeletingId(chatId);
      await deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
    } catch (err) {
      console.error('Error deleting chat:', err);
      alert('Не удалось удалить чат');
    } finally {
      setDeletingId(null);
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Сегодня';
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} нед. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="chat-history-page">
        <Sidebar />
        <div className="chat-history-loading">
          <Loader2 className="spinner" size={48} />
          <p>Загрузка истории...</p>
        </div>
      </div>
    );
  }

  if (error && chats.length === 0) {
    return (
      <div className="chat-history-page">
        <Sidebar />
        <div className="chat-history-error">
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button onClick={loadChats} className="btn btn-primary">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-history-page">
      <Sidebar />
      
      <main className="chat-history-main">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="grid-overlay"></div>

        <div className="chat-history-container">
          {/* Header */}
          <header className="chat-history-header">
            <div className="chat-history-header-left">
              <h1 className="chat-history-title">
                <MessageSquare size={28} />
                История чатов
              </h1>
              <p className="chat-history-subtitle">
                {chats.length} {chats.length === 1 ? 'чат' : chats.length < 5 ? 'чата' : 'чатов'}
              </p>
            </div>
            
            <div className="chat-history-search">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Поиск чатов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </header>

          {/* Chats List */}
          {filteredChats.length === 0 ? (
            <div className="chat-history-empty">
              <div className="empty-icon">
                <MessageSquare size={64} />
              </div>
              <h2>
                {searchQuery ? 'Ничего не найдено' : 'История пуста'}
              </h2>
              <p>
                {searchQuery 
                  ? 'Попробуйте изменить поисковый запрос' 
                  : 'Начните свой первый чат, и он появится здесь'}
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => navigate('/app')} 
                  className="btn btn-primary"
                >
                  Создать чат
                </button>
              )}
            </div>
          ) : (
            <div className="chat-history-list">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="chat-history-item"
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="chat-item-content">
                    <div className="chat-item-icon">
                      <MessageSquare size={20} />
                    </div>
                    
                    <div className="chat-item-info">
                      <div className="chat-item-header">
                        <h3 className="chat-item-title">{chat.title}</h3>
                        <div className="chat-item-meta">
                          <span className="chat-item-date">
                            <Clock size={12} />
                            {formatDate(chat.last_message_at || chat.created_at)}
                          </span>
                          <span className="chat-item-time">
                            {formatTime(chat.last_message_at || chat.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="chat-item-message">
                        {chat.last_message || 'Нет сообщений'}
                      </p>
                      
                      <div className="chat-item-footer">
                        <span className="chat-item-count">
                          {chat.message_count || 0} {(chat.message_count || 0) === 1 ? 'сообщение' : (chat.message_count || 0) < 5 ? 'сообщения' : 'сообщений'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="chat-item-actions">
                    <button
                      className="chat-item-action-btn"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      disabled={deletingId === chat.id}
                      title="Удалить чат"
                    >
                      {deletingId === chat.id ? (
                        <Loader2 className="spinner-small" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                    <ChevronRight size={20} className="chat-item-chevron" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
