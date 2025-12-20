'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyMetrics } from '@/hooks/useMetrics';

interface DistractionLineChartProps {
  data: DailyMetrics[];
}

export function DistractionLineChart({ data }: DistractionLineChartProps) {
  const chartData = data.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Avg Distractions': day.averageDistractions.toFixed(1),
    avgDistractions: day.averageDistractions,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        <Line
          type="monotone"
          dataKey="avgDistractions"
          stroke="#4b5563"
          strokeWidth={2}
          dot={{ fill: '#4b5563', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

