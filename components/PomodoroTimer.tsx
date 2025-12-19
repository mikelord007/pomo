'use client';

interface PomodoroTimerProps {
  timeRemaining: number;
}

export function PomodoroTimer({ timeRemaining }: PomodoroTimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="text-center">
      <div className="text-8xl font-mono font-light tracking-wider text-foreground">
        {formattedTime}
      </div>
    </div>
  );
}

