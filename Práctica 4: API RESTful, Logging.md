# Práctica 4: API RESTful, Logging

13, 14 de Noviembre
José María Guirao (jmguirao@ugr.es)

En esta práctica haremos una API RESTful para la colección de productos.

## Endpoints

Habilitaremos los siguientes endpoints:

```
GET    /api/productos       // todos los productos
GET    /api/productos/:id   // producto con id
POST   /api/productos       // añadir un producto
DELETE /api/productos/:id   // eliminar un producto
PUT    /api/productos/:id   // cambiar el precio de un producto
```

## Router

Seguiremos [API REST con NodeJS + Express y MongoDB](https://dev.to/franciscomendes10866/api-rest-con-nodejs-express-y-mongodb-3jk7), pero teniendo en cuenta los errores posibles en la BD.

Para que funcione la decodificación de los parámetros que se envían en el body, tendremos que añadir el middleware:

```javascript
// tienda.js
...
app.use(express.json())
...
```

## Testing

Utilizaremos la extensión de VSCode [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) para la comprobación y depuración del API. Los endpoints los pondremos en un archivo `test-api.http` para utilizarlos desde REST Client:

```http
// test-api.http

GET http://localhost:8000/api/productos

###

GET http://localhost:8000/api/productos/6719f538fdfbd218f753f044

###

POST http://localhost:8000/api/productos
Content-Type: application/json

{
  "nombre": "Producto de prueba",
  "precio": 29.99
}

###

DELETE http://localhost:8000/api/productos/6719f538fdfbd218f753f044

###

PUT http://localhost:8000/api/productos/6719f538fdfbd218f753f044
Content-Type: application/json

{
  "precio": 39.99
}
```

## Logger

Poner un logger a aplicación como en [A Complete Guide to Winston Logging in Node.js](https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/).

## Para nota

Documentar el API con Swagger como en [Swagger + Node.js (Express): A Step-by-Step Guide](https://medium.com/@kirtikau/swagger-node-js-express-a-step-by-step-guide-d8257acc7c15)
