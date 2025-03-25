/*
  # Add admin policy for products table

  1. Security Changes
    - Add policy for admin users to manage products (create, read, update, delete)
*/

-- Add admin policy
CREATE POLICY "Products are editable by admin users" 
  ON products FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');