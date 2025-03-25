/*
  # Add full name to orders table

  1. Changes
    - Update orders table to use full name from auth metadata
    - Add trigger to automatically set customer name from auth metadata
*/

-- Create function to get user's full name from auth metadata
CREATE OR REPLACE FUNCTION get_user_full_name(user_id uuid)
RETURNS text AS $$
DECLARE
  user_metadata jsonb;
  full_name text;
BEGIN
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = user_id;

  full_name := user_metadata->>'full_name';
  
  IF full_name IS NULL OR full_name = '' THEN
    full_name := COALESCE(
      user_metadata->>'first_name' || ' ' || user_metadata->>'last_name',
      'Cliente'
    );
  END IF;

  RETURN full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to set customer name
CREATE OR REPLACE FUNCTION set_order_customer_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.customer_name := get_user_full_name(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_order_customer_name_trigger ON orders;
CREATE TRIGGER set_order_customer_name_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_customer_name();