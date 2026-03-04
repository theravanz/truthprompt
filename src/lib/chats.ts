import { supabase } from './supabase';

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
  message_count?: number;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  model_name?: string;
  score?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

/**
 * Создает новый чат в Supabase
 */
export async function createChat(title: string = 'Новый чат'): Promise<string> {
  const { data, error } = await supabase.rpc('create_chat', { chat_title: title });

  if (error) throw error;
  return data as string;
}

/**
 * Получает все чаты пользователя через RPC функцию
 */
export async function getUserChats(): Promise<Chat[]> {
  const { data, error } = await supabase.rpc('get_user_chats');

  if (error) throw error;
  return (data as Chat[]) || [];
}

/**
 * Получает чат с сообщениями
 */
export async function getChatWithMessages(chatId: string): Promise<ChatWithMessages | null> {
  // Получаем информацию о чате
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('id, title, created_at, updated_at')
    .eq('id', chatId)
    .single();

  if (chatError || !chat) return null;

  // Получаем сообщения
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id, chat_id, role, content, model_name, score, metadata, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (messagesError) throw messagesError;

  return {
    ...chat,
    last_message: messages?.[messages.length - 1]?.content,
    last_message_at: messages?.[messages.length - 1]?.created_at,
    message_count: messages?.length || 0,
    messages: messages || []
  };
}

/**
 * Добавляет сообщение в чат
 */
export async function addMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
  options?: {
    model_name?: string;
    score?: number;
    metadata?: Record<string, unknown>;
  }
): Promise<Message> {
  const messageData = {
    chat_id: chatId,
    role,
    content,
    model_name: options?.model_name,
    score: options?.score,
    metadata: options?.metadata || {}
  };

  const { data, error } = await supabase
    .from('messages')
    .insert([messageData])
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

/**
 * Обновляет чат (например, заголовок)
 */
export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('chats')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', chatId);

  if (error) throw error;
}

/**
 * Удаляет чат (мягкое удаление)
 */
export async function deleteChat(chatId: string): Promise<void> {
  const { error } = await supabase
    .from('chats')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', chatId);

  if (error) throw error;
}

/**
 * Получает статистику пользователя
 */
export async function getUserStats(): Promise<{
  total_chats: number;
  total_messages: number;
  user_messages: number;
  assistant_messages: number;
  avg_score: number;
} | null> {
  const { data, error } = await supabase.rpc('get_user_stats');
  
  if (error) throw error;
  const stats = (data as any[])?.[0];
  return stats ? {
    total_chats: Number(stats.total_chats),
    total_messages: Number(stats.total_messages),
    user_messages: Number(stats.user_messages),
    assistant_messages: Number(stats.assistant_messages),
    avg_score: Number(stats.avg_score)
  } : null;
}

/**
 * Отправляет запрос к AI через OpenRouter
 */
export async function sendToAI(
  prompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'TruthPrompt'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'Ты TruthPrompt - AI ассистент для анализа промптов и код-ревью. Твоя задача - помогать разработчикам писать качественный код, находить уязвимости, проблемы с производительностью и предлагать улучшения. Отвечай подробно, с примерами кода.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Ошибка при запросе к AI');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Нет ответа от AI';
}
