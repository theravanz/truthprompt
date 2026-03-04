'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface TransitionContextType {
  isTransitioning: boolean;
  transitionData: {
    prompt: string;
    model: string;
    chatId: string;
  } | null;
  startTransition: (data: { prompt: string; model: string; chatId: string }) => void;
  endTransition: () => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState<{
    prompt: string;
    model: string;
    chatId: string;
  } | null>(null);

  const startTransition = useCallback((data: { prompt: string; model: string; chatId: string }) => {
    setTransitionData(data);
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
    setTransitionData(null);
  }, []);

  return (
    <TransitionContext.Provider value={{ isTransitioning, transitionData, startTransition, endTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within TransitionProvider');
  }
  return context;
}
