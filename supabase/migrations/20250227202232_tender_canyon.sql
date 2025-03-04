/*
  # Create conversations table

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `job_id` (uuid, reference to jobs)
      - `user_id` (uuid)
      - `messages` (jsonb array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `conversations` table
    - Add policies for authenticated users to manage their own conversations
    - Create index for faster job-specific lookups
*/

-- Create conversations table to store job-specific chat history
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can read their own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster job-specific conversation lookups
CREATE INDEX idx_conversations_job_id ON conversations(job_id);

-- Set up trigger to update the updated_at timestamp
CREATE TRIGGER set_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();