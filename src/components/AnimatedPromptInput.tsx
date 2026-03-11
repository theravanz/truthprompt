'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowRight, ChevronDown, Plus, Paperclip, X, Mic, Wand2, Brain, CheckSquare, Code2, Lightbulb } from 'lucide-react';
import './AnimatedPromptInput.css';
import { AIVoiceInput } from './AIVoiceInput';

export interface CustomModel {
  id: string;
  name: string;
  icon: string;
  apiEndpoint: string;
  apiKey?: string;
  isCustom: boolean;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

const DEFAULT_MODELS: CustomModel[] = [
  {
    id: 'google/gemma-3-27b-it',
    name: 'Gemma 3',
    icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9x1KPQxtiORiV5wo8km6sygu7msLPSS0GzQ&s',
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    isCustom: false,
  },
  {
    id: 'qwen/qwen3-coder-480b-a35b-free',
    name: 'Qwen Coder',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Qwen_logo.svg/250px-Qwen_logo.svg.png',
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    isCustom: false,
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct',
    name: 'Llama 3.2',
    icon: '​https://ih1.redbubble.net/image.5611428487.0532/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.webp',
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    isCustom: false,
  },
];

interface AnimatedPromptInputProps {
  onAnalyze: (prompt: string, model: CustomModel, selectedTools: string[]) => void;
}

export function AnimatedPromptInput({ onAnalyze }: AnimatedPromptInputProps) {
  const [value, setValue] = useState('');
  const [models, setModels] = useState<CustomModel[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState<CustomModel>(DEFAULT_MODELS[0]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModel, setNewModel] = useState<Partial<CustomModel>>({
    name: '',
    icon: '',
    apiEndpoint: '',
    apiKey: '',
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 300,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showModelDropdown && !(e.target as Element).closest('.model-selector')) {
        setShowModelDropdown(false);
      }
      if (showToolsDropdown && !(e.target as Element).closest('.tools-selector')) {
        setShowToolsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelDropdown, showToolsDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onAnalyze(value, selectedModel, selectedTools);
      setValue('');
      adjustHeight(true);
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onAnalyze(value, selectedModel, selectedTools);
    setValue('');
    adjustHeight(true);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const handleVoiceStart = () => {
    setIsRecording(true);
  };

  const handleVoiceStop = (duration: number) => {
    setIsRecording(false);
    console.log('Recording stopped, duration:', duration);
  };

  const handleVoiceTranscript = (text: string) => {
    setValue(text);
    adjustHeight();
  };

  const handleAddModel = () => {
    if (!newModel.name || !newModel.apiEndpoint) return;

    const customModel: CustomModel = {
      id: `custom-${Date.now()}`,
      name: newModel.name,
      icon: newModel.icon || 'https://images.unsplash.com/photo-1677442136019-21780a5c6b8e?w=32&h=32&fit=crop&crop=faces&auto=format',
      apiEndpoint: newModel.apiEndpoint,
      apiKey: newModel.apiKey,
      isCustom: true,
    };

    setModels([...models, customModel]);
    setSelectedModel(customModel);
    setShowAddModal(false);
    setNewModel({ name: '', icon: '', apiEndpoint: '', apiKey: '' });
  };

  const TOOLS = [
    { id: 'analyze', label: 'Анализ промпта', icon: Brain, description: 'Глубокий анализ задачи перед выполнением' },
    { id: 'clarify', label: 'Уточнение', icon: Lightbulb, description: '1-2 уточняющих вопроса для проверки логики' },
    { id: 'todo', label: 'To-Do план', icon: CheckSquare, description: 'ИИ составляет план выполнения по шагам' },
    { id: 'review', label: 'Критический анализ', icon: Code2, description: 'Поиск ошибок, уязвимостей и заблуждений' },
  ];

  return (
    <>
      <div className="animated-prompt-wrapper">
        <div className="animated-prompt-input">
          <div className="animated-prompt-input__shine" />
          {attachedFile && (
            <div className="attached-file">
              <span className="attached-file-name">{attachedFile.name}</span>
              <button onClick={handleRemoveFile} className="remove-file-btn" type="button">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Voice Recording Panel */}
          {isRecording && (
            <AIVoiceInput
              isActive={isRecording}
              onStart={handleVoiceStart}
              onStop={handleVoiceStop}
              onTranscript={handleVoiceTranscript}
              visualizerBars={48}
            />
          )}
          
          <div className="prompt-input-container">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Напиши функцию для загрузки пользователей..."
              className="prompt-textarea"
              rows={1}
            />

            <div className="prompt-input-footer">
              <div className="prompt-input-actions">
                <div className="prompt-input-left">
                  <label className="action-btn" title="Прикрепить файл">
                    <input
                      type="file"
                      onChange={handleFileAttach}
                      hidden
                    />
                    <Paperclip size={18} />
                  </label>

                  <button
                    className={`action-btn voice-btn ${isRecording ? 'recording' : ''}`}
                    onClick={() => setIsRecording(!isRecording)}
                    title={isRecording ? 'Остановить запись' : 'Голосовой ввод'}
                    type="button"
                  >
                    <Mic size={18} />
                  </button>
                </div>

                <div className="tools-selector">
                  <button
                    className="tools-selector-btn"
                    onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                    type="button"
                  >
                    <Wand2 size={18} />
                    <span>Инструменты</span>
                    <ChevronDown size={16} className={`tools-chevron ${showToolsDropdown ? 'rotated' : ''}`} />
                  </button>

                  {showToolsDropdown && (
                    <div className="tools-dropdown">
                      {TOOLS.map((tool) => {
                        const isSelected = selectedTools.includes(tool.id);
                        return (
                          <button
                            key={tool.id}
                            className={`tools-dropdown-item ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedTools(prev =>
                                isSelected
                                  ? prev.filter(id => id !== tool.id)
                                  : [...prev, tool.id]
                              );
                            }}
                            type="button"
                          >
                            <div className="tools-item-icon">
                              <tool.icon size={18} />
                            </div>
                            <div className="tools-item-content">
                              <span className="tools-item-label">{tool.label}</span>
                              <span className="tools-item-desc">{tool.description}</span>
                            </div>
                            {isSelected && <span className="tools-check">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="model-selector">
                  <button
                    className="model-selector-btn"
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    type="button"
                  >
                    {selectedModel.icon ? (
                      <img src={selectedModel.icon} alt="" className="model-avatar" />
                    ) : (
                      <span className="model-icon">🤖</span>
                    )}
                    <span className="model-name">{selectedModel.name}</span>
                    <ChevronDown size={16} className={`model-chevron ${showModelDropdown ? 'rotated' : ''}`} />
                  </button>

                  {showModelDropdown && (
                    <div className="model-dropdown">
                      {models.map((model) => (
                        <button
                          key={model.id}
                          className={`model-dropdown-item ${selectedModel.id === model.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedModel(model);
                            setShowModelDropdown(false);
                          }}
                          type="button"
                        >
                          {model.icon ? (
                            <img src={model.icon} alt="" className="model-avatar" />
                          ) : (
                            <span className="model-icon">🤖</span>
                          )}
                          <span className="model-name">{model.name}</span>
                          {selectedModel.id === model.id && <span className="model-check">✓</span>}
                        </button>
                      ))}

                      <button
                        className="add-model-btn"
                        onClick={() => {
                          setShowAddModal(true);
                          setShowModelDropdown(false);
                        }}
                        type="button"
                      >
                        <Plus size={18} />
                        <span>Добавить модель</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                className={`send-btn ${value.trim() ? 'active' : ''}`}
                onClick={handleSubmit}
                disabled={!value.trim()}
                type="button"
                aria-label="Анализировать"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-model-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Добавить модель</h3>
            
            <div className="modal-field">
              <label>Название</label>
              <input
                type="text"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                placeholder="GPT-4, Claude, и т.д."
                autoFocus
              />
            </div>

            <div className="modal-field">
              <label>URL иконки</label>
              <input
                type="url"
                value={newModel.icon}
                onChange={(e) => setNewModel({ ...newModel, icon: e.target.value })}
                placeholder="https://example.com/icon.jpg"
              />
              {newModel.icon && (
                <div className="image-preview">
                  <img src={newModel.icon} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <span>Превью иконки</span>
                </div>
              )}
            </div>

            <div className="modal-field">
              <label>API Endpoint</label>
              <input
                type="url"
                value={newModel.apiEndpoint}
                onChange={(e) => setNewModel({ ...newModel, apiEndpoint: e.target.value })}
                placeholder="https://api.example.com/v1/chat"
              />
            </div>

            <div className="modal-field">
              <label>API Key (опционально)</label>
              <input
                type="password"
                value={newModel.apiKey}
                onChange={(e) => setNewModel({ ...newModel, apiKey: e.target.value })}
                placeholder="sk-..."
              />
            </div>

            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowAddModal(false)}>
                Отмена
              </button>
              <button 
                className="modal-add" 
                onClick={handleAddModel}
                disabled={!newModel.name || !newModel.apiEndpoint}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}