/*
  # Add user settings functionality

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `app_id` (text, the app this setting applies to)
      - `custom_instructions` (text, storing the AI instructions)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `user_settings` table
    - Add policies for users to manage their own settings
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  app_id text NOT NULL,
  custom_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create a composite unique constraint on user_id and app_id
-- This ensures each user can only have one settings entry per app
ALTER TABLE user_settings
ADD CONSTRAINT user_settings_user_id_app_id_key UNIQUE (user_id, app_id);

-- Enable RLS on the user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own settings
CREATE POLICY "Users can read their own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own settings
CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own settings
CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own settings
CREATE POLICY "Users can delete their own settings"
  ON user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Set up trigger to update the updated_at timestamp
CREATE TRIGGER set_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();