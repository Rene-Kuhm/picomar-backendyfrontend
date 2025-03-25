/*
  # Add weight fields to products table
  
  1. Changes
    - Add unit_weight column for weight per unit in kg
    - Add box_weight column for weight per box in kg
    - Add check constraints to ensure weights are positive
    
  2. Constraints
    - Weights must be positive numbers
    - Weights can be null (for products where weight is not applicable)
*/

ALTER TABLE products
ADD COLUMN unit_weight NUMERIC DEFAULT NULL,
ADD COLUMN box_weight NUMERIC DEFAULT NULL;

-- Add check constraints to ensure weights are positive when provided
ALTER TABLE products 
ADD CONSTRAINT products_unit_weight_check 
CHECK (unit_weight IS NULL OR unit_weight > 0);

ALTER TABLE products 
ADD CONSTRAINT products_box_weight_check 
CHECK (box_weight IS NULL OR box_weight > 0);