# Práctica 3.2: Autorización

6, 7 de Noviembre
José María Guirao (jmguirao@ugr.es)

Para esta práctica habilitaremos a algunos usuarios para cambiar el precio de los productos.

## Modificación del modelo de usuarios

Primero modificaremos los registros de algunos usuarios para ponerlos como admin. Con mongo-express añadimos un nuevo campo `admin:true` a estos usuarios. Para los demás este campo no existe. Al estar usando una BD-NOSQL no todos los registros tienen que tener los mismos campos. En el caso de una SQL tendríamos que hacer una migración de la BD al cambiar el esquema.

Este cambio se reflejará en el modelo:

```javascript
// ./model/usuarios.js
const UsuariosSchema = new mongoose.Schema({
  ...
  "admin": {
    "type": "Boolean",
    "default": false,
    "required": false
  },
  ...
})
```

## Añadimos los permisos al token JWT

```javascript
// ./routes/router_usuarios.js
  ...                                              // viene del formulario de login
  const user_db = await Usuarios.findOne({username:req.body.usuario})
  const token = jwt.sign({usuario:user_db.username, admin:user_db.admin}, process.env.SECRET_KEY)
  ...
```

## Botón de cambios para el precio

Para los usuarios admin, aparecerán en las tarjetas de los productos un botón **Cambiar precio**, cuya funcionalidad haremos más adelante.
