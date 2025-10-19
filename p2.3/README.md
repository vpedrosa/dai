# Práctica 2.3 - Tienda Online MPA

Aplicación web MPA (Multi-Page Application) para una tienda online que muestra 3 productos aleatorios en la portada.

## Tecnologías Utilizadas

- **Express**: Framework web para Node.js
- **Nunjucks**: Motor de plantillas HTML
- **Mongoose**: ODM para MongoDB
- **Bootstrap 5**: Framework CSS
- **MongoDB**: Base de datos NoSQL
- **Docker**: Contenedores para MongoDB y Mongo Express

## Estructura del Proyecto

```
├── data/                    # Datos de MongoDB (ignorado en git)
├── model/                   # Modelos y conexión a BD
│   ├── db.js               # Conexión a MongoDB
│   └── Producto.js         # Esquema del Producto
├── public/                  # Assets estáticos
│   └── css/
│       └── style.css       # Estilos personalizados
├── routes/                  # Controladores (Routes)
│   └── router_tienda.js    # Rutas de la tienda
├── views/                   # Vistas (Templates)
│   ├── base.html           # Plantilla base con Bootstrap
│   ├── portada.html        # Página principal
│   └── test.html           # Página de prueba
├── .env                     # Variables de entorno (no en git)
├── .gitignore              # Archivos ignorados por git
├── docker-compose.yml      # Configuración de contenedores
├── package.json            # Dependencias del proyecto
├── seed.js                 # Script para poblar la BD
└── tienda.js              # Servidor principal
```

## Arquitectura

El proyecto sigue el patrón **MVC (Model-View-Controller)**:

- **Model**: `model/Producto.js` y `model/db.js`
- **View**: Plantillas Nunjucks en `views/`
- **Controller**: Rutas en `routes/router_tienda.js`

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar MongoDB con Docker

```bash
docker-compose up -d
```

Esto iniciará:
- MongoDB en el puerto **27017**
- Mongo Express en el puerto **8081** (interfaz web: http://localhost:8081)

### 3. Poblar la base de datos

```bash
npm run seed
```

Este comando cargará los productos desde `data/productos.json` a MongoDB.

### 4. Iniciar el servidor

```bash
npm run dev
```

El servidor se ejecutará en **http://localhost:8000**

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con auto-reload
- `npm start`: Inicia el servidor en modo producción
- `npm run seed`: Carga los productos en la base de datos

## Rutas Disponibles

- `/` - Portada con 3 productos aleatorios
- `/hola` - Test del servidor (respuesta JSON)
- `/test` - Test de plantillas

## Variables de Entorno (.env)

```env
USER_DB=root
PASS=example
IN=development
PORT=8000
```

## Características Destacadas

### Selección Aleatoria de Productos (Para Nota)

La portada muestra 3 productos seleccionados aleatoriamente de la base de datos:

1. Se consulta el número total de productos
2. Se generan 3 índices aleatorios únicos
3. Se recuperan los productos correspondientes a esos índices

Ver implementación en `routes/router_tienda.js:11`

### Herencia de Plantillas

Todas las vistas heredan de `base.html` usando Nunjucks:

```html
{% extends "base.html" %}

{% block content %}
  <!-- Contenido específico -->
{% endblock %}
```

### Diseño Responsivo con Bootstrap 5

- Navbar con menú responsive
- Cards de productos con hover effects
- Sistema de grid responsive
- Componentes Bootstrap integrados

## Capturas

### Portada
La portada muestra 3 productos aleatorios con:
- Imagen del producto
- Categoría
- Nombre y descripción
- Precio
- Botón para añadir al carrito

### Hero Section
Sección de bienvenida con gradiente de fondo y llamada a la acción.

## Notas Técnicas

- Las plantillas se recargan automáticamente en modo desarrollo
- El servidor se reinicia automáticamente al guardar cambios (Ctrl+S)
- Los passwords están en variables de entorno, no en el código
- Los datos de MongoDB se almacenan en `./data` (no versionado)

## Limpieza

Para detener y eliminar los contenedores de Docker:

```bash
docker-compose down
```

Para eliminar también los datos:

```bash
docker-compose down -v
rm -rf data/
```

## Autor

Práctica de Desarrollo de Aplicaciones para Internet (DAI)
