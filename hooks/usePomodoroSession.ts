'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { SessionStatus } from '@/types/session';

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

export type SessionState = 'idle' | 'running' | 'completed' | 'abandoned' | 'finished';

interface UsePomodoroSessionReturn {
  timeRemaining: number;
  distractionCount: number;
  sessionState: SessionState;
  startSession: () => void;
  logDistraction: () => void;
  abandonSession: () => void;
  finishSession: () => Promise<void>;
  endSession: () => Promise<void>;
  resetSession: () => void;
}

export function usePomodoroSession(): UsePomodoroSessionReturn {
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_DURATION);
  const [distractionCount, setDistractionCount] = useState(0);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const savedRef = useRef(false);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Pleasant notification tone (two beeps)
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      // Second beep after a short delay
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 800;
        oscillator2.type = 'sine';
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.3);
      }, 400);
    } catch (error) {
      // Fallback: try using HTML5 audio if Web Audio API fails
      console.error('Error playing notification sound:', error);
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (sessionState === 'running' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setSessionState('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionState, timeRemaining]);

  // Play sound when timer completes
  useEffect(() => {
    if (sessionState === 'completed') {
      playNotificationSound();
    }
  }, [sessionState, playNotificationSound]);

  const startSession = useCallback(() => {
    setStartTime(new Date());
    setTimeRemaining(POMODORO_DURATION);
    setDistractionCount(0);
    setSessionState('running');
    savedRef.current = false;
  }, []);

  const logDistraction = useCallback(() => {
    if (sessionState === 'running') {
      setDistractionCount((prev) => prev + 1);
    }
  }, [sessionState]);

  const abandonSession = useCallback(async () => {
    if (sessionState === 'running' && startTime && !savedRef.current) {
      setSessionState('abandoned');
      savedRef.current = true;
      const endTime = new Date();
      
      try {
        await supabase.from('pomodoro_sessions').insert({
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'abandoned',
          distraction_count: distractionCount,
        });
      } catch (error) {
        console.error('Error saving abandoned session:', error);
      }
    }
  }, [sessionState, startTime, distractionCount]);

  const finishSession = useCallback(async () => {
    if (sessionState === 'running' && startTime && !savedRef.current) {
      setSessionState('finished');
      savedRef.current = true;
      const endTime = new Date();
      
      // Finish always marks as clean (work completed early)
      try {
        await supabase.from('pomodoro_sessions').insert({
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'clean',
          distraction_count: distractionCount,
        });
      } catch (error) {
        console.error('Error saving finished session:', error);
      }
    }
  }, [sessionState, startTime, distractionCount]);

  const endSession = useCallback(async () => {
    if (sessionState === 'completed' && startTime && !savedRef.current) {
      savedRef.current = true;
      const endTime = new Date();
      // Determine status: clean if no distractions, recovered if distractions occurred
      const status: SessionStatus = distractionCount > 0 ? 'recovered' : 'clean';

      try {
        await supabase.from('pomodoro_sessions').insert({
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status,
          distraction_count: distractionCount,
        });
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  }, [sessionState, startTime, distractionCount]);

  const resetSession = useCallback(() => {
    setTimeRemaining(POMODORO_DURATION);
    setDistractionCount(0);
    setSessionState('idle');
    setStartTime(null);
    savedRef.current = false;
  }, []);

  return {
    timeRemaining,
    distractionCount,
    sessionState,
    startSession,
    logDistraction,
    abandonSession,
    finishSession,
    endSession,
    resetSession,
  };
}

