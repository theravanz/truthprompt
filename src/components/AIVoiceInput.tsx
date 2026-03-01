'use client';

import { Mic } from 'lucide-react';
import { useState, useEffect } from 'react';
import './AIVoiceInput.css';

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onTranscript?: (text: string) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
}

export function AIVoiceInput({
  onStart,
  onStop,
  onTranscript,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className
}: AIVoiceInputProps) {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: number;

    if (submitted) {
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
          if (submitted) {
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
  }, [submitted, onStart, onStop, onTranscript]);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: number;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else {
      setSubmitted((prev) => !prev);
    }
  };

  return (
    <div className={`ai-voice-input ${className || ''}`}>
      <div className="voice-input-container">
        <button
          className={`voice-btn ${submitted ? 'submitted' : ''}`}
          type="button"
          onClick={handleClick}
        >
          {submitted ? (
            <div className="spinner" />
          ) : (
            <Mic className="mic-icon" />
          )}
        </button>

        <span className={`time-display ${submitted ? 'visible' : ''}`}>
          {formatTime(time)}
        </span>

        <div className="visualizer">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={`visualizer-bar ${submitted && isClient ? 'active' : ''}`}
              style={
                submitted && isClient
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
          {submitted ? 'Listening...' : 'Click to speak'}
        </p>
      </div>
    </div>
  );
}
