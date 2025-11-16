# Práctica 3.1: Autentificación con JWT

30, 31 de Octubre, 6, 7 de Noviembre
José María Guirao (jmguirao@ugr.es)

## Formularios

En esta práctica añadiremos autentificación de usuarios a la tienda on-line. Para esto pondremos una opción **Identificarse** en el menú superior.

Esta opción dará acceso a una página de login en `/usuarios/login` donde se soliciten las credenciales del usuario: username, y password. En esta página habrá un enlace para registrarse en caso de que el usuario no esté dado de alta. El formulario de registro estará en `/usuarios/registro`.

Estos formularios los podemos generar con una IA o usando alguna plantilla como las de [15+ Stunning Examples of Bootstrap Login Forms](https://colorlib.com/wp/bootstrap-login-forms/).

Las credenciales se recogerán en el servidor, comprobándose que existe el usuario y que el password es el que le corresponde. En caso de que no fuera así, se devolverán los correspondientes mensajes de error.

Una vez autentificado se sustituirá en el menú **Identificarse** por **username | Salir**

Todo este código lo pondremos en otro router:

```javascript
// ./routes/router_usuarios.js
...
// Para mostrar formulario de login              --> GET
router.get('/login', (req, res)=>{
    res.render("login.html")
})

// Para recoger datos del formulario de login    --> POST
router.post('/login', async (req, res)=> {
    ...
    res.redirect('/')
})

// Registro
router.get('/registro', (req, res) => {        // --> GET
    res.render("registro.html")
})

router.post('/registro', async (req, res) => {  // --> POST
    ...
    res.redirect("/")
})


// Salida
router.get('/logout', (req, res) => {
    ...
    res.redirect('/')
})
...
```

Que enlazaremos en el servidor:

```javascript
// tienda.js
...
import UsuariosRouter from "./routes/router_usuario.js"
app.use("/usuarios", UsuariosRouter); // para urls que comiencen por /usuarios
...
```

Los parámetros del POST se mandan en el cuerpo del http y se recogen en express como pone en: [Using req.body with POST Parameters](https://masteringjs.io/tutorials/express/post)

## Modelo para usuario

Para el modelo usuarios seguimos: [Mastering User Authentication: Building a Secure User Schema with Mongoose and Bcrypt](https://dev.to/iamcymentho/mastering-user-authentication-building-a-secure-user-schema-with-mongoose-and-bcrypt-2g3k), que incluye contraseñas cifradas.

## Token jwt

Para autentificar usaremos Json Web Tokens, que se intercambiarán entre la aplicación y el navegador en una cookie. Estos tokens incluyen el nombre de usuario cifrado.

Seguimos [Beginner's authentication, JWT and cookies](https://dev.to/franciscomendes10866/beginners-authentication-jwt-and-cookies-59k2). Para generar y enviar el token:

```javascript
import jwt from "jsonwebtoken"
const token = jwt.sign({usuario: user.username}, process.env.SECRET_KEY)

res.cookie("access_token", token, {            // cookie en el response
    httpOnly: true,
    secure: process.env.IN === 'production'      // en producción, solo con https
}).redirect("/")
```

## Middleware de autentificación

Usaremos una función que intercepte el request para comprobar la cookie, y en su caso añadir la información del token:

```javascript
// tienda.js
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
...
app.use(cookieParser())

// middleware de autentificación
const autentificación = (req, res, next) => {
    const token = req.cookies.access_token;
    if (token) {
        const data = jwt.verify(token, process.env.SECRET_KEY);
        req.username = data.usuario                               // username en el request
        app.locals.usuario = data.usuario                         // y accesible en las plantillas {{ usuario }}
    } else {
        app.locals.usuario = undefined
    }
    next()
}
app.use(autentificación)
...
```

## Para nota

Poner los mensajes de error en los mismos formularios en un color destacado, parecido a [Forms server validation en bootstrap 5.3](https://getbootstrap.com/docs/5.3/forms/validation/#server-side)
