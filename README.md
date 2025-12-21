# Tienda Online MPA

Aplicación web de tienda online con carrito de compras, búsqueda, filtros y lazy loading.

## Tecnologías

- **Backend**: Express + Nunjucks + Mongoose
- **Base de datos**: MongoDB
- **Frontend**: Bootstrap 5 + Alpine.js
- **Logging**: Winston
- **Dev**: Docker

## Instalación

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Instalar dependencias
npm install

# 3. Iniciar MongoDB
docker compose up -d

# 4. Poblar base de datos
npm run seed

# 5. Iniciar servidor
npm run dev
```

Servidor: http://localhost:8000
Mongo Express: http://localhost:8081

## Variables de entorno

El archivo `.env.example` contiene las variables necesarias:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `USER_DB` | Usuario de MongoDB | `root` |
| `PASS` | Contraseña de MongoDB | `example` |
| `SECRET_KEY` | Clave secreta para JWT | `mi_clave_secreta_jwt_2025` |

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
├── config/                 # Configuración
│   └── logger.js           # Configuración de Winston
├── model/                  # Modelos
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
│   ├── router_tienda.js    # Rutas de productos y API RESTful
│   └── router_usuarios.js  # Rutas de autenticación
├── views/                  # Vistas Nunjucks
├── public/                 # Assets estáticos
│   ├── css/
│   └── js/                 # Scripts del cliente
└── logs/                   # Archivos de log
```

## Rutas Principales

### Productos
- `/` - Portada (3 productos aleatorios)
- `/productos` - Listado con filtros
- `/producto/:id` - Detalle de producto
- `/productos-admin` - Edición de precios (solo admin)
- `/busqueda-anticipada` - Búsqueda con resultados en tiempo real

### API RESTful
- `GET /api/productos` - Obtener todos los productos (paginados)
- `GET /api/productos/:id` - Obtener producto por ID
- `POST /api/productos` - Crear nuevo producto
- `PUT /api/productos/:id` - Actualizar precio de producto
- `DELETE /api/productos/:id` - Eliminar producto
- `GET /api/busqueda-anticipada/:texto` - Buscar productos por texto

Ver documentación completa en [API.md](API.md)

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

### API RESTful
- Endpoints CRUD completos para productos
- Validación de datos de entrada
- Manejo robusto de errores de BD
- Respuestas JSON estándar
- Códigos HTTP apropiados

### Logging
- Sistema de logging con Winston
- Logs de todas las peticiones HTTP
- Niveles: info, warn, error
- Archivos separados: `combined.log` y `error.log`
- Logs en consola en desarrollo
- Stack traces de errores

## Testing de la API

El proyecto incluye un archivo `test-api.http` para probar todos los endpoints de la API RESTful.

**Requisitos:**
- Extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) para VSCode

**Uso:**
1. Abrir `test-api.http`
2. Actualizar la variable `@productId` con un ID válido
3. Hacer clic en "Send Request" sobre cada endpoint

## Scripts

- `npm run dev` - Desarrollo con auto-reload
- `npm start` - Producción
- `npm run seed` - Poblar BD
- `npm test` - Ejecutar tests
- `npm run test:watch` - Tests en modo watch
- `npm run test:coverage` - Tests con coverage

## Testing

El proyecto incluye tests automatizados con Jest y Supertest para todos los endpoints de la API RESTful.

**Ejecutar tests:**
```bash
# Asegurarse de que MongoDB está corriendo
docker-compose up -d

# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage
```

Los tests cubren:
- ✅ Todos los endpoints CRUD de la API
- ✅ Validación de datos de entrada
- ✅ Manejo de errores (400, 404, 500)
- ✅ Flujo completo de operaciones

Ver más detalles en [`tests/README.md`](tests/README.md)
