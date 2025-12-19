export type SessionStatus = 'clean' | 'recovered' | 'abandoned';

export interface PomodoroSession {
  id: string;
  start_time: string;
  end_time: string | null;
  status: SessionStatus;
  distraction_count: number;
  created_at: string;
}

export interface SessionInput {
  start_time: string;
  end_time: string | null;
  status: SessionStatus;
  distraction_count: number;
}

