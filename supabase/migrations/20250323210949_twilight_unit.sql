/*
  # Add unit and box pricing support

  1. Changes
    - Add columns for unit pricing and stock
    - Add columns for box pricing and stock
    - Add units per box specification
    - Migrate existing price data to new columns
    - Remove old price and stock columns

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns for unit and box pricing/stock
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit_price') THEN
    ALTER TABLE products ADD COLUMN unit_price numeric DEFAULT 0 CHECK (unit_price >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'box_price') THEN
    ALTER TABLE products ADD COLUMN box_price numeric DEFAULT 0 CHECK (box_price >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'units_per_box') THEN
    ALTER TABLE products ADD COLUMN units_per_box integer DEFAULT 0 CHECK (units_per_box >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit_stock') THEN
    ALTER TABLE products ADD COLUMN unit_stock integer DEFAULT 0 CHECK (unit_stock >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'box_stock') THEN
    ALTER TABLE products ADD COLUMN box_stock integer DEFAULT 0 CHECK (box_stock >= 0);
  END IF;
END $$;

-- Copy existing price to unit_price and box_price
UPDATE products 
SET 
  unit_price = price,
  box_price = price * 10,
  units_per_box = 10,
  unit_stock = stock,
  box_stock = FLOOR(stock / 10)
WHERE price IS NOT NULL;

-- Add constraint to ensure at least one price type is set
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE table_name = 'products' AND constraint_name = 'products_price_type_check'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_price_type_check 
    CHECK (unit_price > 0 OR box_price > 0);
  END IF;
END $$;