'use client';

import { Mic } from 'lucide-react';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: number;

    if (isActive) {
      onStart?.();
      
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
          onTranscript?.(transcript);
        };

        recognition.onend = () => {
          // Перезапуск если всё ещё записываем
          if (isActive) {
            try {
              recognition.start();
            } catch (e) {
              // Игнорируем ошибки
            }
          }
        };

        recognition.start();
      }
      
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      onStop?.(time);
      setTime(0);
    }

    return () => clearInterval(intervalId);
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
