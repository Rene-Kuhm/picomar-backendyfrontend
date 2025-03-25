/*
  # Check and Add Weight Constraints to Products Table

  1. Changes
    - Safely add weight constraints if they don't exist
    - Ensures weights are positive when provided
    - Allows NULL values for products where weight is not applicable
  
  2. Implementation
    - Uses DO block to check for constraint existence
    - Only adds constraints if they don't already exist
*/

DO $$ 
BEGIN
  -- Check and add unit_weight constraint
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'products_unit_weight_check'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_unit_weight_check 
    CHECK (unit_weight IS NULL OR unit_weight > 0);
  END IF;

  -- Check and add box_weight constraint
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'products_box_weight_check'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_box_weight_check 
    CHECK (box_weight IS NULL OR box_weight > 0);
  END IF;
END $$;