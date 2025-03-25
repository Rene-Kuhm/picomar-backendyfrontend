/*
  # Insert initial product data

  1. Data Changes
    - Insert initial product catalog including:
      - Pescados Frescos
      - Mariscos
      - Cefalópodos
      - Pescados Ahumados
      - Conservas Gourmet
      - Pescados de Agua Dulce
      - Productos Preparados
      - Pescados Planos
      - Crustáceos
      - Pescados Azules
      - Mariscos Especiales
      - Pescados de Roca
      - Conservas Premium
      - Productos Procesados
      - Pescados Salados
*/

INSERT INTO products (name, description, price, stock, category, image_url) VALUES
-- Pescados Frescos
('Salmón Atlántico', 'Salmón fresco de alta calidad, rico en omega-3', 24.99, 50, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),
('Atún Rojo', 'Atún fresco ideal para sashimi y platillos gourmet', 34.99, 30, 'Pescados', 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80'),
('Lubina', 'Pescado blanco de sabor suave y textura delicada', 19.99, 40, 'Pescados', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80'),
('Dorada', 'Pescado mediterráneo de carne firme y sabrosa', 21.99, 35, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),
('Merluza', 'Pescado blanco versátil, ideal para múltiples preparaciones', 16.99, 45, 'Pescados', 'https://images.unsplash.com/photo-1511421585906-57a6e6dc3677?auto=format&fit=crop&q=80'),

-- Mariscos
('Camarones Jumbo', 'Camarones grandes y jugosos, perfectos para la parrilla', 29.99, 40, 'Mariscos', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80'),
('Langosta Viva', 'Langosta fresca de las mejores aguas', 45.99, 20, 'Mariscos', 'https://images.unsplash.com/photo-1553659971-f01207815844?auto=format&fit=crop&q=80'),
('Mejillones Frescos', 'Mejillones vivos de cultivo sostenible', 12.99, 60, 'Mariscos', 'https://images.unsplash.com/photo-1466553556096-7e2c59f80a22?auto=format&fit=crop&q=80'),
('Almejas Frescas', 'Almejas vivas ideales para pasta alle vongole', 14.99, 50, 'Mariscos', 'https://images.unsplash.com/photo-1585545335512-1e43f40d4999?auto=format&fit=crop&q=80'),
('Ostras Frescas', 'Ostras premium para degustar crudas', 24.99, 40, 'Mariscos', 'https://images.unsplash.com/photo-1553557202-e8e463c3f24b?auto=format&fit=crop&q=80'),

-- Cefalópodos
('Pulpo Fresco', 'Pulpo limpio listo para cocinar', 22.99, 30, 'Cefalópodos', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80'),
('Calamares Frescos', 'Calamares limpios y frescos', 15.99, 40, 'Cefalópodos', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80'),
('Sepia Fresca', 'Sepia limpia lista para cocinar', 18.99, 35, 'Cefalópodos', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80'),

-- Pescados Ahumados
('Salmón Ahumado', 'Salmón ahumado en frío con eneldo', 28.99, 40, 'Ahumados', 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&q=80'),
('Trucha Ahumada', 'Trucha ahumada artesanalmente', 22.99, 35, 'Ahumados', 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&q=80'),
('Atún Ahumado', 'Atún ahumado en caliente', 26.99, 30, 'Ahumados', 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&q=80'),

-- Conservas Gourmet
('Anchoas en Aceite', 'Anchoas del Cantábrico en aceite de oliva', 12.99, 50, 'Conservas', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),
('Ventresca de Atún', 'Ventresca de atún en aceite de oliva', 16.99, 45, 'Conservas', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),
('Sardinas en Aceite', 'Sardinas seleccionadas en aceite de oliva', 9.99, 55, 'Conservas', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),

-- Pescados de Agua Dulce
('Trucha Arcoíris', 'Trucha fresca de criadero sostenible', 17.99, 40, 'Agua Dulce', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),
('Carpa', 'Carpa fresca ideal para platillos asiáticos', 14.99, 35, 'Agua Dulce', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),
('Tilapia', 'Tilapia fresca de cultivo responsable', 12.99, 45, 'Agua Dulce', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),

-- Productos Preparados
('Ceviche de Pescado', 'Ceviche fresco preparado del día', 15.99, 20, 'Preparados', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),
('Salpicón de Mariscos', 'Ensalada de mariscos frescos', 18.99, 15, 'Preparados', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),
('Paella de Mariscos', 'Paella tradicional lista para calentar', 24.99, 10, 'Preparados', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),

-- Pescados Planos
('Lenguado', 'Lenguado fresco de pesca sostenible', 29.99, 25, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),
('Rodaballo', 'Rodaballo salvaje de calidad premium', 34.99, 20, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),
('Platija', 'Platija fresca ideal para frituras', 19.99, 30, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),

-- Crustáceos
('Centolla', 'Centolla viva de las aguas más frías', 39.99, 15, 'Crustáceos', 'https://images.unsplash.com/photo-1553659971-f01207815844?auto=format&fit=crop&q=80'),
('Nécora', 'Nécora viva de la mejor calidad', 22.99, 25, 'Crustáceos', 'https://images.unsplash.com/photo-1553659971-f01207815844?auto=format&fit=crop&q=80'),
('Percebes', 'Percebes frescos del día', 49.99, 10, 'Crustáceos', 'https://images.unsplash.com/photo-1553659971-f01207815844?auto=format&fit=crop&q=80'),

-- Pescados Azules
('Caballa', 'Caballa fresca rica en omega-3', 11.99, 40, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),
('Jurel', 'Jurel fresco del día', 9.99, 45, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),
('Boquerón', 'Boquerón fresco ideal para vinagre', 8.99, 50, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),

-- Mariscos Especiales
('Vieiras Frescas', 'Vieiras frescas con coral', 34.99, 20, 'Mariscos', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80'),
('Navajas', 'Navajas vivas de la ría', 26.99, 25, 'Mariscos', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80'),
('Zamburiñas', 'Zamburiñas frescas del día', 28.99, 20, 'Mariscos', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80'),

-- Pescados de Roca
('Mero', 'Mero fresco de pesca sostenible', 32.99, 20, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),
('Cabracho', 'Cabracho fresco ideal para caldos', 24.99, 25, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),
('Rape', 'Rape fresco de primera calidad', 29.99, 20, 'Pescados', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80'),

-- Conservas Premium
('Caviar de Salmón', 'Huevas de salmón premium', 45.99, 15, 'Conservas', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),
('Huevas de Maruca', 'Huevas de maruca en aceite', 32.99, 20, 'Conservas', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),
('Mojama', 'Mojama de atún extra', 38.99, 25, 'Conservas', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),

-- Productos Procesados
('Hamburguesa de Salmón', 'Hamburguesa artesanal de salmón', 12.99, 30, 'Procesados', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),
('Albóndigas de Merluza', 'Albóndigas caseras de merluza', 11.99, 35, 'Procesados', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),
('Croquetas de Bacalao', 'Croquetas artesanales de bacalao', 10.99, 40, 'Procesados', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),

-- Pescados Salados
('Bacalao Salado', 'Bacalao salado premium', 25.99, 30, 'Salados', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),
('Arenque Salado', 'Arenque salado tradicional', 18.99, 35, 'Salados', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80'),
('Sardinas Saladas', 'Sardinas saladas artesanales', 15.99, 40, 'Salados', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a44?auto=format&fit=crop&q=80');