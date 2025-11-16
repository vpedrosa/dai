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

## Autenticación y Autorización

### Usuario Administrador

Al ejecutar el seed (`npm run seed`) se crea automáticamente un usuario administrador:

- **Usuario**: `admin`
- **Contraseña**: `admin123`

Los usuarios administradores tienen acceso a:
- Botón "Cambiar precio" en las tarjetas de productos
- Gestión de precios de productos

### Sistema de Autenticación

- Registro de usuarios con validación
- Login con JWT almacenado en cookies
- Contraseñas cifradas con bcrypt
- Middleware de autenticación global

## Arquitectura MVC

```
├── model/                   # Modelos
│   ├── db.js               # Conexión MongoDB
│   ├── Producto.js         # Esquema Producto
│   ├── Usuario.js          # Esquema Usuario
│   └── Carrito.js          # Modelo Carrito
├── services/               # Lógica de negocio
│   └── carritoService.js   # Servicio del carrito
├── controllers/            # Controladores
│   ├── productosController.js
│   ├── carritoController.js
│   └── usuariosController.js
├── middlewares/            # Middlewares
│   └── carritoMiddleware.js
├── routes/                 # Rutas
│   ├── router_tienda.js    # Rutas de productos
│   └── router_usuarios.js  # Rutas de autenticación
├── views/                  # Vistas Nunjucks
└── public/                 # Assets estáticos
    ├── css/
    └── js/                 # Scripts del cliente
```

## Rutas Principales

### Productos
- `/` - Portada (3 productos aleatorios)
- `/productos` - Listado con filtros
- `/producto/:id` - Detalle de producto
- `/api/productos` - API paginación
- `/api/buscar` - API búsqueda

### Usuarios
- `/usuarios/login` - Iniciar sesión
- `/usuarios/registro` - Registrarse
- `/usuarios/logout` - Cerrar sesión

### Carrito
- `/carrito` - Carrito de compras
- `/api/carrito/*` - APIs del carrito

## Características

### Productos
- Carrito de compras en sesión
- Búsqueda en tiempo real
- Infinite scroll (lazy loading)
- Filtros por categoría
- Productos relacionados
- Precios rebajados
- Diseño responsive

### Autenticación y Seguridad
- Registro e inicio de sesión de usuarios
- Autenticación con JWT
- Contraseñas cifradas con bcrypt
- Cookies HTTP-only para tokens
- Sistema de roles (admin/usuario)
- Autorización basada en permisos

## Scripts

- `npm run dev` - Desarrollo con auto-reload
- `npm start` - Producción
- `npm run seed` - Poblar BD
