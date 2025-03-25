/*
  # Update product categories to new structure

  1. Changes
    - Update existing products to use only three main categories:
      - Pescados
      - Mariscos
      - Pollo
    - Maintain all other product attributes
*/

-- Update fish products
UPDATE products 
SET category = 'Pescados'
WHERE category IN (
  'Pescados',
  'Agua Dulce',
  'Ahumados',
  'Salados'
);

-- Update seafood products
UPDATE products 
SET category = 'Mariscos'
WHERE category IN (
  'Mariscos',
  'Cefalópodos',
  'Crustáceos'
);

-- Insert some chicken products
INSERT INTO products (
  name,
  description,
  category,
  price,
  unit_price,
  box_price,
  units_per_box,
  unit_stock,
  box_stock,
  image_url
) VALUES
(
  'Pechuga de Pollo',
  'Pechuga de pollo fresca, sin hueso y sin piel',
  'Pollo',
  15.99,
  15.99,
  149.99,
  10,
  50,
  10,
  'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80'
),
(
  'Muslos de Pollo',
  'Muslos de pollo frescos con piel',
  'Pollo',
  12.99,
  12.99,
  119.99,
  10,
  60,
  12,
  'https://images.unsplash.com/photo-1588767768106-1b20e51d9d68?auto=format&fit=crop&q=80'
),
(
  'Alitas de Pollo',
  'Alitas de pollo frescas, ideales para hornear o freír',
  'Pollo',
  10.99,
  10.99,
  99.99,
  10,
  80,
  15,
  'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80'
),
(
  'Pollo Entero',
  'Pollo entero fresco, limpio y listo para cocinar',
  'Pollo',
  25.99,
  25.99,
  249.99,
  10,
  30,
  8,
  'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80'
);