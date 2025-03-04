/*
  # Add Database Indexes for Query Performance
  
  1. Indexes
    - Add indexes to frequently queried columns to improve search and filter operations
    - Add full-text search capabilities for job title and description
  
  2. Performance
    - Optimize the most common query patterns
    - Ensure efficient sorting on frequently sorted columns
*/

-- Add index for jobs table for common search/filter fields
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- Add combined index for common filtering patterns (user's jobs with specific status)
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON jobs(user_id, status);

-- Add GIN index for full-text search on title and description
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || description)) STORED;

CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING GIN(search_vector);

-- Create a function for full-text search
CREATE OR REPLACE FUNCTION search_jobs(search_query TEXT)
RETURNS SETOF jobs AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM jobs
  WHERE search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(search_vector, plainto_tsquery('english', search_query)) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;