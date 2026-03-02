'use client';

import { Mic } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './AIVoiceInput.css';

interface AIVoiceInputProps {
  isActive: boolean;
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onTranscript?: (text: string) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
}

export function AIVoiceInput({
  isActive,
  onStart,
  onStop,
  onTranscript,
  visualizerBars = 48,
  className
}: AIVoiceInputProps) {
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isActive) {
      onStart?.();

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechRecognition();
        rec.lang = 'en-US';
        rec.interimResults = true;
        rec.continuous = true;

        rec.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          onTranscript?.(transcript);
        };

        rec.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.error('[Voice] Error:', event.error);
          }
        };

        rec.onend = () => {
          // Используем ref для проверки текущего состояния
          if (isActiveRef.current && recognitionRef.current === rec) {
            try {
              rec.start();
            } catch (e) {
              // Игнорируем ошибки
            }
          }
        };

        rec.start();
        recognitionRef.current = rec;

        const intervalId = setInterval(() => {
          setTime((t) => t + 1);
        }, 1000);

        return () => {
          clearInterval(intervalId);
          // Принудительно останавливаем распознавание при размонтировании или деактивации
          if (recognitionRef.current) {
            try {
              recognitionRef.current.abort();
            } catch (e) {
              // Игнорируем ошибки
            }
            recognitionRef.current = null;
          }
        };
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Игнорируем ошибки
        }
        recognitionRef.current = null;
      }
      onStop?.(time);
      setTime(0);
    }
  }, [isActive, onStart, onStop, onTranscript]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`ai-voice-input ${className || ''}`}>
      <div className="voice-input-container">
        <button
          className="voice-btn"
          type="button"
        >
          {isActive ? (
            <div className="spinner" />
          ) : (
            <Mic className="mic-icon" />
          )}
        </button>

        <span className={`time-display ${isActive ? 'visible' : ''}`}>
          {formatTime(time)}
        </span>

        <div className="visualizer">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={`visualizer-bar ${isActive && isClient ? 'active' : ''}`}
              style={
                isActive && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="status-text">
          {isActive ? 'Listening...' : 'Click to speak'}
        </p>
      </div>
    </div>
  );
}
