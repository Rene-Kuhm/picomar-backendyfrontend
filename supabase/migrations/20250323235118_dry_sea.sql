/*
  # Fix Admin Role Management

  1. Changes
    - Create admin_users table to track admin roles
    - Add function to validate admin role
    - Update policies to use the new validation
*/

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing admin policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
  DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
END $$;

-- Create new admin policies using the is_admin function
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can view all order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Insert test admin user if not exists (using your email)
INSERT INTO admin_users (id)
SELECT id FROM auth.users 
WHERE email = 'your-email@example.com' -- Replace with your email
ON CONFLICT (id) DO NOTHING;