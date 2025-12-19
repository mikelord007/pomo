'use client';

import Link from 'next/link';
import { useMetrics } from '@/hooks/useMetrics';
import { SessionBarChart } from '@/components/charts/SessionBarChart';
import { DistractionLineChart } from '@/components/charts/DistractionLineChart';
import { RecoveryRateChart } from '@/components/charts/RecoveryRateChart';

export default function MetricsPage() {
  const { metrics, loading, error } = useMetrics();

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">Loading metrics...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12 text-red-500">Error: {error}</div>
        </div>
      </main>
    );
  }

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toFixed(1);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light">Metrics</h1>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-foreground transition-colors"
          >
            ← Pomodoro
          </Link>
        </div>

        {/* Today vs Yesterday Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border border-foreground/10 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Today</h2>
            {metrics.today ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions:</span>
                  <span className="font-medium">{metrics.today.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clean:</span>
                  <span className="font-medium">{metrics.today.cleanSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recovered:</span>
                  <span className="font-medium">{metrics.today.recoveredSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Abandoned:</span>
                  <span className="font-medium text-gray-400">{metrics.today.abandonedSessions}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-foreground/10">
                  <span className="text-gray-600">Avg Distractions:</span>
                  <span className="font-medium">{formatNumber(metrics.today.averageDistractions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recovery Rate:</span>
                  <span className="font-medium">{formatPercentage(metrics.today.recoveryRate)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No sessions today</p>
            )}
          </div>

          <div className="border border-foreground/10 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Yesterday</h2>
            {metrics.yesterday ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions:</span>
                  <span className="font-medium">{metrics.yesterday.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clean:</span>
                  <span className="font-medium">{metrics.yesterday.cleanSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recovered:</span>
                  <span className="font-medium">{metrics.yesterday.recoveredSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Abandoned:</span>
                  <span className="font-medium text-gray-400">{metrics.yesterday.abandonedSessions}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-foreground/10">
                  <span className="text-gray-600">Avg Distractions:</span>
                  <span className="font-medium">{formatNumber(metrics.yesterday.averageDistractions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recovery Rate:</span>
                  <span className="font-medium">{formatPercentage(metrics.yesterday.recoveryRate)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No sessions yesterday</p>
            )}
          </div>
        </div>

        {/* Last 7 Days Summary */}
        <div className="border border-foreground/10 rounded-lg p-6 mb-12">
          <h2 className="text-lg font-medium mb-4">Last 7 Days Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Total Sessions</div>
              <div className="text-2xl font-light">
                {metrics.last7Days.reduce((sum, day) => sum + day.totalSessions, 0)}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Clean Sessions</div>
              <div className="text-2xl font-light">
                {metrics.last7Days.reduce((sum, day) => sum + day.cleanSessions, 0)}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Recovered Sessions</div>
              <div className="text-2xl font-light">
                {metrics.last7Days.reduce((sum, day) => sum + day.recoveredSessions, 0)}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Abandoned Sessions</div>
              <div className="text-2xl font-light text-gray-400">
                {metrics.last7Days.reduce((sum, day) => sum + day.abandonedSessions, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-12">
          <div className="border border-foreground/10 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Sessions by Type (Last 7 Days)</h2>
            <SessionBarChart data={metrics.last7Days} />
          </div>

          <div className="border border-foreground/10 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Average Distractions per Session</h2>
            <DistractionLineChart data={metrics.last7Days} />
          </div>

          <div className="border border-foreground/10 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Recovery Rate Trend</h2>
            <RecoveryRateChart data={metrics.last7Days} />
          </div>
        </div>
      </div>
    </main>
  );
}

