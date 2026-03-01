'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowRight, ChevronDown, Download, FileCode, FlaskConical, Search, Plus, Paperclip, Mic, MicOff, X, StopCircle } from 'lucide-react';
import './AnimatedPromptInput.css';

interface CustomModel {
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
    id: 'gpt4-1-mini',
    name: 'GPT-4.1 Mini',
    icon: 'https://images.unsplash.com/photo-1677442136019-21780a5c6b8e?w=32&h=32&fit=crop&crop=faces&auto=format',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    isCustom: false,
  },
  {
    id: 'gpt4-1',
    name: 'GPT-4.1',
    icon: 'https://images.unsplash.com/photo-1677442136019-21780a5c6b8e?w=32&h=32&fit=crop&crop=faces&auto=format',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    isCustom: false,
  },
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    icon: 'https://images.unsplash.com/photo-1676277791608-ac54585e6876?w=32&h=32&fit=crop&crop=faces&auto=format',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    isCustom: false,
  },
  {
    id: 'gemini',
    name: 'Gemini 2.5 Flash',
    icon: 'https://images.unsplash.com/photo-1677442136019-21780a5c6b8e?w=32&h=32&fit=crop&crop=faces&auto=format',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
    isCustom: false,
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    icon: 'https://images.unsplash.com/photo-1676277791608-ac54585e6876?w=32&h=32&fit=crop&crop=faces&auto=format',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    isCustom: false,
  },
];

interface AnimatedPromptInputProps {
  onAnalyze: (prompt: string, model: CustomModel) => void;
  onTemplateClick: (templateId: string) => void;
}

export function AnimatedPromptInput({ onAnalyze, onTemplateClick }: AnimatedPromptInputProps) {
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
  const [recordingTime, setRecordingTime] = useState(0);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 300,
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRecording) {
      intervalId = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(intervalId);
  }, [isRecording]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showModelDropdown && !(e.target as Element).closest('.model-selector')) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onAnalyze(value, selectedModel);
      setValue('');
      adjustHeight(true);
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onAnalyze(value, selectedModel);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
      // Остановка записи и получение результата
    } else {
      setIsRecording(true);
      // Web Speech API для распознавания речи
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.interimResults = true;
        recognition.continuous = true;
        
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setValue(transcript);
          adjustHeight();
        };
        
        recognition.onend = () => {
          // Не останавливаем таймер, если пользователь не нажал стоп
        };
        
        recognition.start();
      }
    }
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

  const TEMPLATES = [
    { id: 'fetch', label: 'Fetch', icon: Download },
    { id: 'react', label: 'React', icon: FileCode },
    { id: 'tests', label: 'Тесты', icon: FlaskConical },
    { id: 'explain', label: 'Объяснить', icon: Search },
  ];

  return (
    <>
      <div className="animated-prompt-wrapper">
        <div className="animated-prompt-input">
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
            <div className="voice-recording-panel">
              <button
                className="voice-record-btn"
                onClick={handleVoiceInput}
                type="button"
              >
                <StopCircle size={24} className="record-icon" />
              </button>
              <span className="recording-time">{formatTime(recordingTime)}</span>
              <div className="voice-visualizer">
                {[...Array(48)].map((_, i) => (
                  <div
                    key={i}
                    className="visualizer-bar"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              <p className="recording-status">Слушаю...</p>
            </div>
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
                    onClick={handleVoiceInput}
                    title={isRecording ? 'Остановить запись' : 'Голосовой ввод'}
                    type="button"
                  >
                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </div>

                <div className="prompt-templates">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      className="template-chip-animated"
                      onClick={() => onTemplateClick(template.id)}
                      type="button"
                    >
                      <template.icon size={14} />
                      {template.label}
                    </button>
                  ))}
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