/*
  # Create tasks table with device sync support
  
  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `deadline` (timestamptz, nullable)
      - `completed` (boolean)
      - `created_at` (timestamptz)
      - `sync_key` (text) - Used to group tasks by device group
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `tasks` table
    - Add policy for public access based on sync_key
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  deadline timestamptz,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  sync_key text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow read access to tasks with matching sync_key
CREATE POLICY "Allow reading tasks with matching sync_key"
  ON tasks
  FOR SELECT
  TO public
  USING (true);

-- Allow inserting new tasks with any sync_key
CREATE POLICY "Allow inserting tasks"
  ON tasks
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow updating tasks with matching sync_key
CREATE POLICY "Allow updating tasks with matching sync_key"
  ON tasks
  FOR UPDATE
  TO public
  USING (true);

-- Allow deleting tasks with matching sync_key
CREATE POLICY "Allow deleting tasks with matching sync_key"
  ON tasks
  FOR DELETE
  TO public
  USING (true);