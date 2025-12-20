'use client';

import type { SessionStatus } from '@/types/session';

interface SessionSummaryProps {
  status: SessionStatus;
  distractionCount: number;
  onClose: () => void;
}

export function SessionSummary({ status, distractionCount, onClose }: SessionSummaryProps) {
  const statusLabels = {
    clean: 'Clean Session',
    abandoned: 'Abandoned Session',
  };

  const statusDescriptions = {
    clean: `You completed the session${distractionCount > 0 ? ` with ${distractionCount} distraction${distractionCount !== 1 ? 's' : ''}` : ' without distractions'}.`,
    abandoned: 'The session was abandoned.',
  };

  const isAbandoned = status === 'abandoned';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className={`bg-background border rounded-lg p-8 max-w-md w-full mx-4 ${
          isAbandoned ? 'border-gray-400/30' : 'border-foreground/20'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-semibold mb-4 ${isAbandoned ? 'text-gray-400' : ''}`}>
          {statusLabels[status]}
        </h2>
        <p className={`mb-6 ${isAbandoned ? 'text-gray-500' : 'text-gray-600'}`}>
          {statusDescriptions[status]}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

