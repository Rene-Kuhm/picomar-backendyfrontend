/*
  # Fix Admin Role Assignment

  1. Changes
    - Insert renekuhm as admin user
    - Update policies to use admin_users table
*/

-- Insert renekuhm as admin
INSERT INTO admin_users (id)
SELECT id FROM auth.users 
WHERE email = 'renekuhm2@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Ensure RLS is enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_users table
CREATE POLICY "Admins can view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Drop and recreate function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;