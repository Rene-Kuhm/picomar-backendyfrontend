/*
  # Update user metadata functions

  1. Changes
    - Drop trigger first to handle dependencies
    - Drop existing functions
    - Create new function to get user metadata including contact info
    - Update order trigger function to use contact info
    - Recreate trigger with new functionality
*/

-- Drop trigger first to handle dependencies
DROP TRIGGER IF EXISTS set_order_customer_name_trigger ON orders;

-- Drop existing functions
DROP FUNCTION IF EXISTS get_user_full_name(uuid);
DROP FUNCTION IF EXISTS set_order_customer_name();

-- Create new function to get user metadata
CREATE FUNCTION get_user_full_name(user_id uuid)
RETURNS TABLE (
  full_name text,
  phone text,
  address text
) AS $$
DECLARE
  user_metadata jsonb;
BEGIN
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = user_id;

  RETURN QUERY
  SELECT 
    COALESCE(
      user_metadata->>'full_name',
      NULLIF(user_metadata->>'first_name' || ' ' || user_metadata->>'last_name', ' '),
      'Cliente'
    )::text,
    NULLIF(user_metadata->>'phone', '')::text,
    NULLIF(user_metadata->>'address', '')::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger function
CREATE FUNCTION set_order_customer_name()
RETURNS TRIGGER AS $$
DECLARE
  user_info record;
BEGIN
  SELECT * INTO user_info FROM get_user_full_name(NEW.user_id);
  
  NEW.customer_name := user_info.full_name;
  
  -- Only set phone and address if they're not already provided
  IF NEW.customer_phone IS NULL THEN
    NEW.customer_phone := user_info.phone;
  END IF;
  
  IF NEW.delivery_address IS NULL THEN
    NEW.delivery_address := user_info.address;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER set_order_customer_name_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_customer_name();