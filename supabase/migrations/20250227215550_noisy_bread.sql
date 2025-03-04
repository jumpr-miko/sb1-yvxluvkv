/*
  # Add AI Rating Fields

  1. Schema Changes
    - Add `ai_rating` column to applicants (integer)
    - Add `ai_summary` column to applicants (text)
  
  2. New Indexes
    - Create index on ai_rating for faster queries and sorting
*/

-- Add AI Rating and Summary fields to the applicants table
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS ai_rating integer;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS ai_summary text;

-- Create index for faster sorting by AI rating
CREATE INDEX IF NOT EXISTS idx_applicants_ai_rating ON applicants(ai_rating);