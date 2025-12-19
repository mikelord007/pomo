// Database types matching Supabase schema
export type SessionStatus = 'clean' | 'recovered' | 'abandoned';

export interface Database {
  public: {
    Tables: {
      pomodoro_sessions: {
        Row: {
          id: string;
          start_time: string;
          end_time: string | null;
          status: SessionStatus;
          distraction_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          start_time: string;
          end_time?: string | null;
          status: SessionStatus;
          distraction_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          start_time?: string;
          end_time?: string | null;
          status?: SessionStatus;
          distraction_count?: number;
          created_at?: string;
        };
      };
    };
  };
}

