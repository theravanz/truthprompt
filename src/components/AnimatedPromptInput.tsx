'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowRight, ChevronDown, Download, FileCode, FlaskConical, Search } from 'lucide-react';
import './AnimatedPromptInput.css';

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
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

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const AI_MODELS = [
  'GPT-4-1 Mini',
  'GPT-4-1',
  'Claude 3.5 Sonnet',
  'Gemini 2.5 Flash',
  'o3-mini',
];

const MODEL_ICONS: Record<string, string> = {
  'GPT-4-1 Mini': '🤖',
  'GPT-4-1': '🤖',
  'Claude 3.5 Sonnet': '🎭',
  'Gemini 2.5 Flash': '💎',
  'o3-mini': '⚡',
};

interface AnimatedPromptInputProps {
  onAnalyze: (prompt: string) => void;
  onTemplateClick: (template: string) => void;
}

export function AnimatedPromptInput({ onAnalyze, onTemplateClick }: AnimatedPromptInputProps) {
  const [value, setValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-4-1 Mini');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 56,
    maxHeight: 300,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onAnalyze(value);
      setValue('');
      adjustHeight(true);
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onAnalyze(value);
    setValue('');
    adjustHeight(true);
  };

  const TEMPLATES = [
    { id: 'fetch', label: 'Fetch', icon: Download },
    { id: 'react', label: 'React', icon: FileCode },
    { id: 'tests', label: 'Тесты', icon: FlaskConical },
    { id: 'explain', label: 'Объяснить', icon: Search },
  ];

  return (
    <div className="animated-prompt-wrapper">
      <div className="animated-prompt-input">
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
              <div className="model-selector">
                <button
                  className="model-selector-btn"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  type="button"
                >
                  <span className="model-icon">{MODEL_ICONS[selectedModel]}</span>
                  <span className="model-name">{selectedModel}</span>
                  <ChevronDown size={14} className={`model-chevron ${showModelDropdown ? 'rotated' : ''}`} />
                </button>

                {showModelDropdown && (
                  <div className="model-dropdown">
                    {AI_MODELS.map((model) => (
                      <button
                        key={model}
                        className={`model-dropdown-item ${selectedModel === model ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelDropdown(false);
                        }}
                        type="button"
                      >
                        <span className="model-icon">{MODEL_ICONS[model]}</span>
                        <span className="model-name">{model}</span>
                        {selectedModel === model && <span className="model-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
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
  );
}
