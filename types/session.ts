export type SessionStatus = 'clean' | 'abandoned';

export interface PomodoroSession {
  id: string;
  start_time: string;
  end_time: string | null;
  status: SessionStatus;
  distraction_count: number;
  distraction_timestamps?: string[] | null;
  created_at: string;
}

export interface SessionInput {
  start_time: string;
  end_time: string | null;
  status: SessionStatus;
  distraction_count: number;
  distraction_timestamps?: string[] | null;
}

