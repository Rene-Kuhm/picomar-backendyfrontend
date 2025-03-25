/*
  # Fix Admin Orders Policies

  1. Changes
    - Add admin policies for orders and order_items tables
    - Allow admins to view and manage all orders
    - Ensure proper access control for regular users

  2. Security
    - Maintain existing user policies
    - Add specific admin policies
*/

-- Drop existing admin policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
  DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
END $$;

-- Create admin policies for orders
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

-- Create admin policies for order items
CREATE POLICY "Admins can view all order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

-- Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;