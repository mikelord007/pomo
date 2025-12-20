'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DailyMetrics } from '@/hooks/useMetrics';
import type { PomodoroSession } from '@/types/session';

interface FocusTimeChartProps {
  data: DailyMetrics[];
}

interface CustomBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload?: {
    date: string;
    focusTimeMinutes: number;
    sessions: PomodoroSession[];
  };
}

function CustomBar(props: any) {
  const { x, y, width, height, payload } = props;
  // Recharts passes the entire data object as payload
  const sessions = (payload?.sessions || []) as PomodoroSession[];
  
  if (!sessions || sessions.length === 0) {
    return <rect x={x} y={y} width={width} height={height} fill="#4b5563" />;
  }

  // Calculate cumulative positions for session dividers
  const totalMinutes = sessions.reduce((sum, session) => {
    if (session.start_time && session.end_time) {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60);
    }
    return sum;
  }, 0);

  const dividers: JSX.Element[] = [];
  const distractionLines: JSX.Element[] = [];
  
  let cumulativeMinutes = 0;
  
  sessions.forEach((session, index) => {
    if (session.start_time && session.end_time) {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      const sessionDuration = (end.getTime() - start.getTime()) / (1000 * 60);
      
      // Add white horizontal divider between sessions (except before first session)
      // Dividers show where one session ends and another begins in terms of time
      if (index > 0 && cumulativeMinutes > 0 && totalMinutes > 0) {
        const dividerY = y + (cumulativeMinutes / totalMinutes) * height;
        dividers.push(
          <line
            key={`divider-${index}`}
            x1={x}
            y1={dividerY}
            x2={x + width}
            y2={dividerY}
            stroke="#ffffff"
            strokeWidth={2}
          />
        );
      }
      
      // Add red horizontal lines for distractions within this session
      // These show when distractions occurred in terms of time (Y-axis position)
      if (session.distraction_timestamps && session.distraction_timestamps.length > 0) {
        session.distraction_timestamps.forEach((timestamp, distIndex) => {
          const distractionTime = new Date(timestamp);
          const distractionOffset = (distractionTime.getTime() - start.getTime()) / (1000 * 60);
          
          // Only render if distraction is within session bounds
          if (distractionOffset >= 0 && distractionOffset <= sessionDuration && totalMinutes > 0) {
            const distractionY = y + ((cumulativeMinutes + distractionOffset) / totalMinutes) * height;
            distractionLines.push(
              <line
                key={`distraction-${index}-${distIndex}`}
                x1={x}
                y1={distractionY}
                x2={x + width}
                y2={distractionY}
                stroke="#ef4444"
                strokeWidth={2}
              />
            );
          }
        });
      }
      
      cumulativeMinutes += sessionDuration;
    }
  });

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#4b5563" />
      {dividers}
      {distractionLines}
    </g>
  );
}

export function FocusTimeChart({ data }: FocusTimeChartProps) {
  const chartData = data.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    focusTimeMinutes: day.totalFocusTimeMinutes,
    sessions: day.sessions || [],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hours = Math.floor(data.focusTimeMinutes / 60);
      const minutes = Math.round(data.focusTimeMinutes % 60);
      return (
        <div className="bg-white border border-gray-200 rounded p-2 shadow-sm">
          <p className="text-sm font-medium text-gray-900">{data.date}</p>
          <p className="text-sm text-gray-800 font-medium">
            {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          </p>
          <p className="text-xs text-gray-700 mt-1">
            {data.sessions.length} session{data.sessions.length !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis 
          stroke="#6b7280" 
          label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="focusTimeMinutes" shape={(props: any) => <CustomBar {...props} />} />
      </BarChart>
    </ResponsiveContainer>
  );
}

