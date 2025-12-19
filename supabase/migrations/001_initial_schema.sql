-- Create enum for session status
CREATE TYPE session_status AS ENUM ('clean', 'recovered', 'abandoned');

-- Create pomodoro_sessions table
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status session_status NOT NULL,
  distraction_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX idx_pomodoro_sessions_created_at ON pomodoro_sessions(created_at DESC);

-- For single-user app, we can disable RLS or create a simple policy
-- Disabling RLS for simplicity (personal use)
ALTER TABLE pomodoro_sessions DISABLE ROW LEVEL SECURITY;

