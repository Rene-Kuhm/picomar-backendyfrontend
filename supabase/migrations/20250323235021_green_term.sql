/*
  # Fix Admin Orders Policies

  1. Changes
    - Drop and recreate admin policies with correct syntax
    - Ensure proper access for admins to all orders and order items
    - Fix role check syntax

  2. Security
    - Maintain existing user policies
    - Add specific admin policies with proper checks
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
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- Create admin policies for order items
CREATE POLICY "Admins can view all order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;