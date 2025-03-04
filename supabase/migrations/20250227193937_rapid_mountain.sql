/*
  # Create jobs table

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `type` (text, not null)
      - `location` (text, not null)
      - `description` (text, not null)
      - `requirements` (text array, not null)
      - `status` (text, not null)
      - `candidate_count` (integer, not null, default 0)
      - `user_id` (uuid, not null, references auth.users)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `jobs` table
    - Add policies for authenticated users to read, insert, update, and delete their own jobs
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  requirements text[] NOT NULL,
  status text NOT NULL,
  candidate_count integer NOT NULL DEFAULT 0,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own jobs
CREATE POLICY "Users can read their own jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own jobs
CREATE POLICY "Users can insert their own jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own jobs
CREATE POLICY "Users can update their own jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to delete their own jobs
CREATE POLICY "Users can delete their own jobs"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);