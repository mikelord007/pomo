'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyMetrics } from '@/hooks/useMetrics';

interface DistractionsPerHourChartProps {
  data: DailyMetrics[];
}

export function DistractionsPerHourChart({ data }: DistractionsPerHourChartProps) {
  const chartData = data.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Distractions/Hour': day.distractionsPerHour.toFixed(1),
    distractionsPerHour: day.distractionsPerHour,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value as number;
      return (
        <div className="bg-white border border-gray-200 rounded p-2 shadow-sm">
          <p className="text-sm font-medium text-gray-900">{payload[0].payload.date}</p>
          <p className="text-sm text-gray-800 font-medium">
            {value.toFixed(1)} distractions/hour
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis 
          stroke="#6b7280"
          label={{ value: 'Distractions/Hour', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="distractionsPerHour"
          stroke="#4b5563"
          strokeWidth={2}
          dot={{ fill: '#4b5563', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

