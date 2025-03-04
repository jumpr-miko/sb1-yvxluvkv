/*
  # Create applicants table

  1. New Tables
    - `applicants`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs.id)
      - `name` (text, not null)
      - `email` (text, not null)
      - `status` (text, not null)
      - `resume_url` (text)
      - `interview_sent` (boolean, not null, default false)
      - `interview_completed` (boolean, not null, default false)
      - `applied_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `applicants` table
    - Add policies for authenticated users to manage their applicants
*/

-- Create applicants table
CREATE TABLE IF NOT EXISTS applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  resume_url text,
  interview_sent boolean NOT NULL DEFAULT false,
  interview_completed boolean NOT NULL DEFAULT false,
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for applicants table
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_applicants_job_id ON applicants(job_id);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);

-- Create RLS policies for the applicants table
CREATE POLICY "Users can read applicants for their jobs"
  ON applicants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applicants.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert applicants for their jobs"
  ON applicants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applicants.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update applicants for their jobs"
  ON applicants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applicants.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete applicants for their jobs"
  ON applicants
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applicants.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

-- Set up trigger to update the updated_at timestamp
CREATE TRIGGER set_applicants_updated_at
BEFORE UPDATE ON applicants
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();