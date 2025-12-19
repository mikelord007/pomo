'use client';

import { useState, useEffect } from 'react';

interface SessionControlsProps {
  sessionState: 'idle' | 'running' | 'completed' | 'abandoned' | 'finished';
  distractionCount: number;
  onStart: () => void;
  onLogDistraction: () => void;
  onAbandon: () => void;
  onFinish: () => void;
  onReset: () => void;
}

export function SessionControls({
  sessionState,
  distractionCount,
  onStart,
  onLogDistraction,
  onAbandon,
  onFinish,
  onReset,
}: SessionControlsProps) {
  const [justLoggedDistraction, setJustLoggedDistraction] = useState(false);

  // Visual feedback when distraction is logged
  useEffect(() => {
    if (sessionState === 'running' && distractionCount > 0) {
      setJustLoggedDistraction(true);
      const timer = setTimeout(() => setJustLoggedDistraction(false), 300);
      return () => clearTimeout(timer);
    }
  }, [distractionCount, sessionState]);

  if (sessionState === 'idle') {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onStart}
          className="px-8 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity active:scale-95"
        >
          Start Pomodoro
        </button>
        <p className="text-sm text-gray-500">Press Space or Enter to start</p>
      </div>
    );
  }

  if (sessionState === 'running') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3">
          <button
            onClick={onLogDistraction}
            className={`px-6 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-all active:scale-95 ${
              justLoggedDistraction ? 'bg-foreground/10 scale-105' : ''
            }`}
          >
            Log Distraction ({distractionCount})
          </button>
          <button
            onClick={onFinish}
            className="px-6 py-2 border border-green-500/30 text-green-500 rounded-lg hover:bg-green-500/10 transition-colors active:scale-95"
          >
            Finish
          </button>
          <button
            onClick={onAbandon}
            className="px-6 py-2 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors active:scale-95"
          >
            Abandon
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded">D</kbd> for distraction,{' '}
          <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded">A</kbd> to abandon
        </p>
      </div>
    );
  }

  if (sessionState === 'completed' || sessionState === 'abandoned' || sessionState === 'finished') {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onReset}
          className="px-6 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
        >
          New Session
        </button>
      </div>
    );
  }

  return null;
}

