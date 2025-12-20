'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { PomodoroSession } from '@/types/session';

export interface DailyMetrics {
  date: string;
  totalSessions: number;
  cleanSessions: number;
  abandonedSessions: number;
  totalDistractions: number;
  averageDistractions: number;
  distractionsPerHour: number;
  totalFocusTimeMinutes: number;
  sessions: PomodoroSession[]; // Include sessions for chart rendering
}

export interface MetricsData {
  today: DailyMetrics | null;
  yesterday: DailyMetrics | null;
  last7Days: DailyMetrics[];
  allSessions: PomodoroSession[];
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    today: null,
    yesterday: null,
    last7Days: [],
    allSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all sessions
        const { data, error: fetchError } = await supabase
          .from('pomodoro_sessions')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const sessions = (data || []) as PomodoroSession[];

        // Group sessions by date (local timezone)
        const sessionsByDate = groupSessionsByDate(sessions);

        // Calculate today's metrics
        const today = new Date();
        const todayKey = formatDateKey(today);
        const todayMetrics = calculateDailyMetrics(sessionsByDate[todayKey] || []);

        // Calculate yesterday's metrics
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = formatDateKey(yesterday);
        const yesterdayMetrics = calculateDailyMetrics(sessionsByDate[yesterdayKey] || []);

        // Calculate last 7 days
        const last7Days: DailyMetrics[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateKey = formatDateKey(date);
          const dayMetrics = calculateDailyMetrics(sessionsByDate[dateKey] || []);
          dayMetrics.date = dateKey;
          last7Days.push(dayMetrics);
        }

        setMetrics({
          today: todayMetrics.date ? todayMetrics : null,
          yesterday: yesterdayMetrics.date ? yesterdayMetrics : null,
          last7Days,
          allSessions: sessions,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function groupSessionsByDate(sessions: PomodoroSession[]): Record<string, PomodoroSession[]> {
  const grouped: Record<string, PomodoroSession[]> = {};

  sessions.forEach((session) => {
    const date = new Date(session.created_at);
    const dateKey = formatDateKey(date);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(session);
  });

  return grouped;
}

function calculateDailyMetrics(sessions: PomodoroSession[]): DailyMetrics {
  const totalSessions = sessions.length;
  const cleanSessions = sessions.filter((s) => s.status === 'clean').length;
  const abandonedSessions = sessions.filter((s) => s.status === 'abandoned').length;
  const totalDistractions = sessions.reduce((sum, s) => sum + s.distraction_count, 0);
  const averageDistractions = totalSessions > 0 ? totalDistractions / totalSessions : 0;
  
  // Calculate total focus time in minutes
  const totalFocusTimeMinutes = sessions.reduce((sum, session) => {
    if (session.start_time && session.end_time) {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = durationMs / (1000 * 60);
      return sum + durationMinutes;
    }
    return sum;
  }, 0);
  
  // Calculate distractions per hour
  const totalHours = totalFocusTimeMinutes / 60;
  const distractionsPerHour = totalHours > 0 ? totalDistractions / totalHours : 0;

  return {
    date: sessions.length > 0 ? formatDateKey(new Date(sessions[0].created_at)) : '',
    totalSessions,
    cleanSessions,
    abandonedSessions,
    totalDistractions,
    averageDistractions,
    distractionsPerHour,
    totalFocusTimeMinutes,
    sessions,
  };
}

