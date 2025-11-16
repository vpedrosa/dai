// tienda.js
import express   from "express"
import nunjucks  from "nunjucks"
import session   from "express-session"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"

import connectDB from "./model/db.js"
await connectDB()

import TiendaRouter from "./routes/router_tienda.js"
import UsuariosRouter from "./routes/router_usuarios.js"

const app = express()

// Middleware para parsear JSON y cookies
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // Para parsear datos de formularios
app.use(cookieParser())

const IN = process.env.IN || 'development'

const env = nunjucks.configure('views', {         // directorio 'views' para las plantillas html
    autoescape: true,
    noCache:    IN === 'development',   // true para desarrollo, sin cache
    watch:      IN === 'development',   // reinicio con Ctrl-S
    express: app
})

// Filtro personalizado para formatear precios en formato español (0,77€)
env.addFilter('formatearPrecio', function(precio) {
    if (typeof precio === 'number') {
        return `${precio.toFixed(2).replace('.', ',')}€`;
    }
    return precio;
});

// Filtro para convertir objetos/arrays a JSON seguro para Alpine.js
env.addFilter('toJson', function(obj) {
    return JSON.stringify(obj);
});

app.set('view engine', 'html')

// Configuración de sesiones
app.use(session({
    secret: 'my-secret',      // a secret string used to sign the session ID cookie
    resave: false,            // don't save session if unmodified
    saveUninitialized: true   // create session even if nothing stored (needed for cart display)
}))

// Middleware de autentificación JWT
const autentificacion = (req, res, next) => {
    const token = req.cookies.access_token;
    if (token) {
        try {
            const data = jwt.verify(token, process.env.SECRET_KEY);
            req.username = data.usuario;                          // username en el request
            req.admin = data.admin;                               // admin en el request
            app.locals.usuario = data.usuario;                    // accesible en las plantillas {{ usuario }}
            app.locals.admin = data.admin;                        // accesible en las plantillas {{ admin }}
        } catch (error) {
            // Token inválido o expirado
            app.locals.usuario = undefined;
            app.locals.admin = undefined;
        }
    } else {
        app.locals.usuario = undefined;
        app.locals.admin = undefined;
    }
    next();
}
app.use(autentificacion)

app.use('/static', express.static('public'))     // directorio public para archivos css, js, imágenes, etc.

// test para el servidor
app.get("/hola", (req, res) => {
  res.send('Hola desde el servidor');
});

// test para las plantillas
app.get("/test", (req, res) => {
  res.render('test.html');
});

// Rutas de la aplicación
app.use("/usuarios", UsuariosRouter);  // para urls que comiencen por /usuarios
app.use("/", TiendaRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})
