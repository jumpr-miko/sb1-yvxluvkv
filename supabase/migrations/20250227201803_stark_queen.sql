/*
  # Fix jobs table RLS and add automatic timestamp updates

  1. Changes
    - Create function to automatically update timestamps
    - Add DEFAULT value to user_id column to use authenticated user's ID
    - Add trigger to automatically update updated_at timestamp

  2. Security
    - Fix RLS policy for insertion to properly check user_id
*/

-- First create the trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add default value for user_id to use the authenticated user's ID
ALTER TABLE jobs 
ALTER COLUMN user_id 
SET DEFAULT auth.uid();

-- Re-create RLS policies to ensure they're correct
DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
CREATE POLICY "Users can insert their own jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure updated at timestamp is automatically updated
DROP TRIGGER IF EXISTS set_updated_at ON jobs;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();