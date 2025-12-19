'use client';

import { useState, useEffect } from 'react';

interface FloatingPomodoroWidgetProps {
  timeRemaining: number;
  distractionCount: number;
  onLogDistraction: () => void;
  onAbandon: () => void;
}

export function FloatingPomodoroWidget({
  timeRemaining,
  distractionCount,
  onLogDistraction,
  onAbandon,
}: FloatingPomodoroWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (isMinimized) {
    return (
      <div
        className="fixed z-50 bg-background/95 backdrop-blur-sm border border-foreground/20 rounded-lg shadow-lg cursor-pointer"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onClick={() => setIsMinimized(false)}
      >
        <div className="px-3 py-2">
          <div className="text-sm font-mono font-medium">{formattedTime}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed z-50 bg-background/95 backdrop-blur-sm border border-foreground/20 rounded-lg shadow-lg"
      style={{ left: `${position.x}px`, top: `${position.y}px`, minWidth: '200px' }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between p-2 border-b border-foreground/10">
        <div className="text-xs font-medium text-gray-500">Pomodoro</div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-foreground transition-colors"
            title="Minimize"
          >
            −
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className="text-center">
          <div className="text-2xl font-mono font-medium">{formattedTime}</div>
          {distractionCount > 0 && (
            <div className="text-xs text-gray-500 mt-1">Distractions: {distractionCount}</div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onLogDistraction}
            className="flex-1 px-3 py-1.5 text-xs border border-foreground/20 rounded hover:bg-foreground/5 transition-colors active:scale-95"
          >
            D ({distractionCount})
          </button>
          <button
            onClick={onAbandon}
            className="px-3 py-1.5 text-xs border border-red-500/30 text-red-500 rounded hover:bg-red-500/10 transition-colors active:scale-95"
          >
            A
          </button>
        </div>
      </div>
    </div>
  );
}

