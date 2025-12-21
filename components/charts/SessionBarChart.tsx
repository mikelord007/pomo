'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DailyMetrics } from '@/hooks/useMetrics';

interface SessionBarChartProps {
  data: DailyMetrics[];
}

export function SessionBarChart({ data }: SessionBarChartProps) {
  const chartData = data.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Clean: day.cleanSessions,
    Abandoned: day.abandonedSessions,
  }));

  return (
    <ResponsiveContainer width="100%" height={300} style={{ outline: 'none' }}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            color: '#111827',
          }}
          labelStyle={{
            color: '#111827',
            fontWeight: 500,
          }}
          itemStyle={{
            color: '#1f2937',
            fontWeight: 500,
          }}
        />
        <Legend />
        <Bar dataKey="Clean" fill="#4b5563" />
        <Bar dataKey="Abandoned" fill="#9ca3af" />
      </BarChart>
    </ResponsiveContainer>
  );
}

