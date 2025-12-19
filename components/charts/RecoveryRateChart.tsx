'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyMetrics } from '@/hooks/useMetrics';

interface RecoveryRateChartProps {
  data: DailyMetrics[];
}

export function RecoveryRateChart({ data }: RecoveryRateChartProps) {
  const chartData = data.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Recovery Rate': `${(day.recoveryRate * 100).toFixed(0)}%`,
    recoveryRate: day.recoveryRate * 100, // Convert to percentage
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis
          stroke="#6b7280"
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
          }}
          formatter={(value: number | undefined) => {
            if (value === undefined) return ['0%', 'Recovery Rate'];
            return [`${value.toFixed(1)}%`, 'Recovery Rate'];
          }}
        />
        <Line
          type="monotone"
          dataKey="recoveryRate"
          stroke="#4b5563"
          strokeWidth={2}
          dot={{ fill: '#4b5563', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

