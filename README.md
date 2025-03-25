# MarDelicia E-commerce

Plataforma de comercio electrónico para productos del mar y pollo.

## Características

- Catálogo de productos con categorías (Pescados, Mariscos, Pollo)
- Sistema de pedidos con opciones por unidad y por caja
- Chat de soporte con asistente AI
- Panel de administración
- Autenticación de usuarios
- Gestión de pedidos
- Sistema de notificaciones

## Tecnologías

- React
- TypeScript
- Tailwind CSS
- Supabase
- Vite

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Rene-Kuhm/picomar-backendyfrontend.git
```

2. Instalar dependencias:
```bash
cd picomar-backendyfrontend
npm install
```

3. Configurar variables de entorno:
- Copiar `.env.example` a `.env`
- Actualizar las variables con tus credenciales de Supabase

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

- `/src/components`: Componentes reutilizables
- `/src/pages`: Páginas de la aplicación
- `/src/contexts`: Contextos de React (Auth)
- `/src/lib`: Utilidades y configuración
- `/supabase/migrations`: Migraciones de la base de datos

## Licencia

MIT