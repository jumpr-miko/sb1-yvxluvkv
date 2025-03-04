/*
  # Add Storage Bucket and RLS Policies

  1. Storage Configuration
    - Creates 'job-attachments' bucket if it doesn't exist
    - Sets up private access for sensitive job-related files
  
  2. Security
    - Enables RLS on storage buckets
    - Adds policies for authenticated users to:
      - Read files for jobs they own
      - Insert files for jobs they own
      - Update files for jobs they own
      - Delete files for jobs they own
*/

-- Check if storage is installed and enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_net'
  ) THEN
    CREATE EXTENSION IF NOT EXISTS pg_net;
  END IF;
END $$;

-- Create the job-attachments bucket if it doesn't exist
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'job-attachments'
  ) INTO bucket_exists;

  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('job-attachments', 'job-attachments', FALSE);
  END IF;
END $$;

-- Enable RLS on storage objects (files)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts when running migrations multiple times
DROP POLICY IF EXISTS "Users can read their job files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload job files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their job files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their job files" ON storage.objects;

-- Create policy to allow users to read files for jobs they own
CREATE POLICY "Users can read their job files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-attachments' AND
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id::text = (storage.foldername(name))[1] 
    AND jobs.user_id = auth.uid()
  )
);

-- Create policy to allow users to upload files for jobs they own
CREATE POLICY "Users can upload job files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'job-attachments' AND
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id::text = (storage.foldername(name))[1] 
    AND jobs.user_id = auth.uid()
  )
);

-- Create policy to allow users to update files for jobs they own
CREATE POLICY "Users can update their job files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'job-attachments' AND
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id::text = (storage.foldername(name))[1] 
    AND jobs.user_id = auth.uid()
  )
);

-- Create policy to allow users to delete files for jobs they own
CREATE POLICY "Users can delete their job files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'job-attachments' AND
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id::text = (storage.foldername(name))[1] 
    AND jobs.user_id = auth.uid()
  )
);