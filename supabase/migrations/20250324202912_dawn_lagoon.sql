/*
  # Set default box weight for all products

  1. Changes
    - Set default box weight to 6kg for all products
    - Ensure box_weight is not null for existing products
*/

-- Update existing products to have 6kg box weight
UPDATE products 
SET box_weight = 6
WHERE box_weight IS NULL;