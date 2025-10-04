# DAI - Proyecto de Scraping y Base de Datos

Proyecto para parsear archivos HTML de productos de Mercadona, almacenarlos en MongoDB y realizar consultas sobre ellos.

## Requisitos

- Node.js
- Docker y Docker Compose
- MongoDB (mediante Docker)

## Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Copiar el archivo de configuración de ejemplo:

```bash
cp .env.example .env
```

3. Iniciar los contenedores de Docker:

```bash
docker compose up -d
```

## Scripts disponibles

### `npm run seed`

Ejecuta el proceso completo de carga de datos:

- Parsea todos los archivos HTML de la carpeta `htmlToParse`
- Genera archivos JSON individuales en `parsedJson/`
- Genera un archivo `parsedJson/all.json` con todos los productos
- Limpia la base de datos MongoDB
- Inserta todos los productos en MongoDB

### `npm run queries`

Ejecuta consultas de ejemplo sobre la base de datos:

- Productos de menos de 1€
- Productos de menos de 1€ que no sean agua
- Aceites ordenados por precio
- Productos en garrafa

### `npm run backup`

Crea una copia de seguridad de la base de datos:

- Utiliza `mongodump` dentro del contenedor Docker
- Genera un archivo `.archive` con timestamp
- Copia el backup a la raíz del proyecto

### `npm run full-process`

Ejecuta secuencialmente: `seed` → `queries` → `backup`

## Descripción de archivos

### Scripts principales

- **`seed.js`**: Procesa todos los archivos HTML de productos, genera los archivos JSON correspondientes, y carga todos los productos en la base de datos MongoDB. Elimina los productos existentes antes de insertar los nuevos.

- **`queries.js`**: Ejecuta varias consultas de ejemplo sobre la base de datos de productos (productos baratos, aceites, productos en garrafa, etc.)

- **`backup.js`**: Realiza una copia de seguridad de la base de datos MongoDB usando `mongodump` dentro del contenedor Docker. La copia se guarda como archivo `.archive` con timestamp y se copia a la raíz del proyecto.

- **`parser_aceites.js`**: Script original para parsear archivos HTML. Ha sido refactorizado en el servicio `ProductParser`.

### Servicios

- **`src/services/productParser.js`**: Clase para parsear archivos HTML de productos de Mercadona y generar archivos JSON con la información extraída.

### Modelos

- **`src/model/Product.js`**: Schema de Mongoose para el modelo de productos.

- **`src/model/db.js`**: Configuración y conexión a la base de datos MongoDB usando Mongoose.

### Carpetas

- **`htmlToParse/`**: Carpeta donde se colocan los archivos HTML a procesar
- **`parsedJson/`**: Carpeta donde se generan los archivos JSON parseados
- **`data/`**: Volumen de Docker para la persistencia de MongoDB

## Estructura de datos

Cada producto tiene los siguientes campos:

```json
{
  "category": "Aceite, vinagre y sal",
  "subcategory": "Aceite de oliva",
  "imageUrl": "https://...",
  "text1": "Nombre del producto",
  "text2": "Formato (ej: Botella 1 L)",
  "priceText": "3,55 € /ud.",
  "priceEuros": 3.55
}
```

## Servicios Docker

- **MongoDB**: Puerto 27017
- **Mongo Express**: Puerto 8081 (interfaz web para MongoDB)

Acceder a Mongo Express: http://localhost:8081
