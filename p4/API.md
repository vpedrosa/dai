# API RESTful - Documentación

Esta es la documentación de la API RESTful para la gestión de productos de la tienda online.

## Endpoints Disponibles

### 1. Obtener todos los productos (paginados)

**GET** `/api/productos`

Devuelve una lista paginada de productos.

**Parámetros de consulta:**
- `pagina` (opcional): Número de página (default: 1)
- `limite` (opcional): Productos por página (default: 12)
- `categoria` (opcional): Filtrar por categoría
- `busqueda` (opcional): Buscar productos por texto

**Respuesta exitosa (200):**
```json
{
  "productos": [...],
  "pagina": 1,
  "totalPaginas": 5,
  "totalProductos": 50,
  "tieneMas": true
}
```

**Ejemplo:**
```http
GET http://localhost:8000/api/productos?pagina=1&limite=12
```

---

### 2. Obtener un producto por ID

**GET** `/api/productos/:id`

Devuelve los detalles de un producto específico.

**Parámetros de URL:**
- `id`: ID del producto (MongoDB ObjectId)

**Respuesta exitosa (200):**
```json
{
  "_id": "6719f538fdfbd218f753f044",
  "text1": "Nombre del producto",
  "text2": "Descripción",
  "priceEuros": 29.99,
  "priceText": "29,99 € /ud.",
  "imageUrl": "https://...",
  "category": "Categoría"
}
```

**Errores:**
- `400`: ID de producto inválido
- `404`: Producto no encontrado

**Ejemplo:**
```http
GET http://localhost:8000/api/productos/6719f538fdfbd218f753f044
```

---

### 3. Crear un nuevo producto

**POST** `/api/productos`

Crea un nuevo producto en la base de datos.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Nombre del producto",
  "descripcion": "Descripción del producto",
  "precio": 29.99,
  "imagen": "https://url-de-imagen.com/imagen.jpg",
  "categoria": "Categoría"
}
```

**Campos:**
- `nombre` (obligatorio): Nombre del producto
- `precio` (obligatorio): Precio del producto (número >= 0)
- `descripcion` (opcional): Descripción del producto
- `imagen` (opcional): URL de la imagen (default: placeholder)
- `categoria` (opcional): Categoría (default: "Sin categoría")

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "mensaje": "Producto creado correctamente",
  "producto": { ... }
}
```

**Errores:**
- `400`: Datos inválidos o campos obligatorios faltantes
- `500`: Error al crear el producto

**Ejemplo:**
```http
POST http://localhost:8000/api/productos
Content-Type: application/json

{
  "nombre": "Producto de prueba",
  "descripcion": "Este es un producto de prueba",
  "precio": 29.99,
  "categoria": "Test"
}
```

---

### 4. Actualizar un producto

**PUT** `/api/productos/:id`

Actualiza el precio de un producto existente.

**Headers:**
```
Content-Type: application/json
```

**Parámetros de URL:**
- `id`: ID del producto (MongoDB ObjectId)

**Body:**
```json
{
  "precio": 39.99
}
```

**Campos:**
- `precio` (obligatorio): Nuevo precio del producto (número >= 0)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Producto actualizado correctamente",
  "producto": { ... }
}
```

**Errores:**
- `400`: ID inválido o precio inválido
- `404`: Producto no encontrado
- `500`: Error al actualizar el producto

**Ejemplo:**
```http
PUT http://localhost:8000/api/productos/6719f538fdfbd218f753f044
Content-Type: application/json

{
  "precio": 39.99
}
```

---

### 5. Eliminar un producto

**DELETE** `/api/productos/:id`

Elimina un producto de la base de datos.

**Parámetros de URL:**
- `id`: ID del producto (MongoDB ObjectId)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Producto eliminado correctamente",
  "producto": {
    "_id": "6719f538fdfbd218f753f044",
    "nombre": "Nombre del producto"
  }
}
```

**Errores:**
- `400`: ID de producto inválido
- `404`: Producto no encontrado
- `500`: Error al eliminar el producto

**Ejemplo:**
```http
DELETE http://localhost:8000/api/productos/6719f538fdfbd218f753f044
```

---

## Manejo de Errores

Todos los errores devuelven un objeto JSON con el siguiente formato:

```json
{
  "error": "Descripción del error"
}
```

### Códigos de estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos inválidos o mal formados
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

---

## Logging

La aplicación utiliza **Winston** para el logging de todas las operaciones:

### Archivos de log

- `logs/combined.log`: Todos los logs
- `logs/error.log`: Solo errores

### Niveles de log

- `info`: Operaciones exitosas
- `warn`: Advertencias (recursos no encontrados, validaciones fallidas)
- `error`: Errores del servidor

### Formato de logs

```
2024-11-16 10:30:45 [info]: GET /api/productos 200 - 45ms
2024-11-16 10:31:12 [info]: POST /api/productos - Creando nuevo producto
2024-11-16 10:31:12 [info]: Producto creado exitosamente: Producto de prueba (6719f538fdfbd218f753f044)
```

---

## Probando la API

Puedes probar la API usando:

1. **REST Client** (extensión de VSCode): Utiliza el archivo `test-api.http`
2. **Postman**: Importa los endpoints manualmente
3. **curl**: Desde la línea de comandos
4. **Thunder Client**: Extensión alternativa de VSCode

### Ejemplo con curl

```bash
# Obtener todos los productos
curl http://localhost:8000/api/productos

# Obtener un producto por ID
curl http://localhost:8000/api/productos/6719f538fdfbd218f753f044

# Crear un producto
curl -X POST http://localhost:8000/api/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Producto nuevo","precio":19.99}'

# Actualizar precio
curl -X PUT http://localhost:8000/api/productos/6719f538fdfbd218f753f044 \
  -H "Content-Type: application/json" \
  -d '{"precio":25.99}'

# Eliminar producto
curl -X DELETE http://localhost:8000/api/productos/6719f538fdfbd218f753f044
```
