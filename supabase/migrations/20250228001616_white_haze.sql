/*
  # Fix storage policies for job attachments

  This migration modifies the storage policies to ensure proper
  access to job attachments.
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their job files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload job files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their job files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their job files" ON storage.objects;

-- Create policy to allow users to read files from the job-attachments bucket
CREATE POLICY "Users can read job files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-attachments'
);

-- Create policy to allow users to upload files to the job-attachments bucket
CREATE POLICY "Users can upload job files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'job-attachments'
);

-- Create policy to allow users to update their files
CREATE POLICY "Users can update job files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'job-attachments'
);

-- Create policy to allow users to delete their files
CREATE POLICY "Users can delete job files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'job-attachments'
);