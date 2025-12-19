'use client';

import { useEffect } from 'react';
import { usePomodoroSession } from '@/hooks/usePomodoroSession';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { SessionControls } from '@/components/SessionControls';
import { SessionSummary } from '@/components/SessionSummary';
import Link from 'next/link';

export default function Home() {
  const {
    timeRemaining,
    distractionCount,
    sessionState,
    startSession,
    logDistraction,
    abandonSession,
    finishSession,
    endSession,
    resetSession,
  } = usePomodoroSession();

  // Handle end of session
  useEffect(() => {
    if (sessionState === 'completed') {
      endSession();
    }
  }, [sessionState, endSession]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (sessionState === 'idle') {
          e.preventDefault();
          startSession();
        }
      } else if (e.key === 'd' || e.key === 'D') {
        if (sessionState === 'running') {
          e.preventDefault();
          logDistraction();
        }
      } else if (e.key === 'a' || e.key === 'A') {
        if (sessionState === 'running') {
          e.preventDefault();
          abandonSession();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sessionState, startSession, logDistraction, abandonSession]);

  const handleReset = () => {
    resetSession();
  };

  const showSummary = sessionState === 'completed' || sessionState === 'abandoned' || sessionState === 'finished';
  const summaryStatus = 
    sessionState === 'abandoned' ? 'abandoned' : 
    sessionState === 'finished' ? 'clean' : 
    (distractionCount > 0 ? 'recovered' : 'clean');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-light">Pomodoro Focus Tracker</h1>
          <Link
            href="/metrics"
            className="text-sm text-gray-500 hover:text-foreground transition-colors"
          >
            Metrics →
          </Link>
        </div>

        <div className="flex flex-col items-center gap-12 py-12">
          <PomodoroTimer timeRemaining={timeRemaining} />
          <SessionControls
            sessionState={sessionState}
            distractionCount={distractionCount}
            onStart={startSession}
            onLogDistraction={logDistraction}
            onAbandon={abandonSession}
            onFinish={finishSession}
            onReset={handleReset}
          />
        </div>
      </div>

      {showSummary && (
        <SessionSummary
          status={summaryStatus}
          distractionCount={distractionCount}
          onClose={handleReset}
        />
      )}
    </main>
  );
}
