# Tienda Online MPA

Aplicación web de tienda online con carrito de compras, búsqueda, filtros y lazy loading.

## Tecnologías

- **Backend**: Express + Nunjucks + Mongoose
- **Base de datos**: MongoDB
- **Frontend**: Bootstrap 5 + Alpine.js
- **Dev**: Docker

## Instalación

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Instalar dependencias
npm install

# 3. Iniciar MongoDB
docker-compose up -d

# 4. Poblar base de datos
npm run seed

# 5. Iniciar servidor
npm run dev
```

Servidor: http://localhost:8000
Mongo Express: http://localhost:8081

## Arquitectura MVC

```
├── model/                   # Modelos
│   ├── db.js               # Conexión MongoDB
│   ├── Producto.js         # Esquema Producto
│   └── Carrito.js          # Modelo Carrito
├── services/               # Lógica de negocio
│   └── carritoService.js   # Servicio del carrito
├── controllers/            # Controladores
│   ├── productosController.js
│   └── carritoController.js
├── middlewares/            # Middlewares
│   └── carritoMiddleware.js
├── routes/                 # Rutas
│   └── router_tienda.js    # Definición de rutas
├── views/                  # Vistas Nunjucks
└── public/                 # Assets estáticos
    ├── css/
    └── js/                 # Scripts del cliente
```

## Rutas Principales

- `/` - Portada (3 productos aleatorios)
- `/productos` - Listado con filtros
- `/producto/:id` - Detalle de producto
- `/carrito` - Carrito de compras
- `/api/productos` - API paginación
- `/api/buscar` - API búsqueda
- `/api/carrito/*` - APIs del carrito

## Características

- Carrito de compras en sesión
- Búsqueda en tiempo real
- Infinite scroll (lazy loading)
- Filtros por categoría
- Productos relacionados
- Precios rebajados
- Diseño responsive

## Scripts

- `npm run dev` - Desarrollo con auto-reload
- `npm start` - Producción
- `npm run seed` - Poblar BD
