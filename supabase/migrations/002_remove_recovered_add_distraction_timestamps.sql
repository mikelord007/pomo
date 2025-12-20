-- Update existing 'recovered' sessions to 'clean'
UPDATE pomodoro_sessions SET status = 'clean' WHERE status = 'recovered';

-- Add distraction_timestamps column to pomodoro_sessions table
ALTER TABLE pomodoro_sessions 
ADD COLUMN distraction_timestamps JSONB DEFAULT NULL;

-- Create new enum without 'recovered'
CREATE TYPE session_status_new AS ENUM ('clean', 'abandoned');

-- Update the table to use the new enum
ALTER TABLE pomodoro_sessions 
ALTER COLUMN status TYPE session_status_new 
USING status::text::session_status_new;

-- Drop the old enum and rename the new one
DROP TYPE session_status;
ALTER TYPE session_status_new RENAME TO session_status;

