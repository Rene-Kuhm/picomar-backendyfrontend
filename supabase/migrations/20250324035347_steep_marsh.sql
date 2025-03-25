/*
  # Add customer information to orders

  1. Changes
    - Add customer_name column with temporary default
    - Add customer_phone column
    - Add delivery_address column
    - Add validation constraints for data quality

  2. Notes
    - Handle existing data by setting a default value
    - Add constraints after data is properly initialized
*/

-- First add columns with a default value for existing rows
ALTER TABLE orders
ADD COLUMN customer_name TEXT NOT NULL DEFAULT 'Cliente',
ADD COLUMN customer_phone TEXT,
ADD COLUMN delivery_address TEXT;

-- Now we can safely add the constraints
ALTER TABLE orders
ADD CONSTRAINT orders_customer_name_check 
CHECK (length(customer_name) >= 3);

ALTER TABLE orders
ADD CONSTRAINT orders_customer_phone_check 
CHECK (customer_phone IS NULL OR length(customer_phone) >= 6);

ALTER TABLE orders
ADD CONSTRAINT orders_delivery_address_check 
CHECK (delivery_address IS NULL OR length(delivery_address) >= 10);