// ./controllers/usuariosController.js
import Usuario from "../model/Usuario.js";
import jwt from "jsonwebtoken";

// Mostrar formulario de login
export const mostrarLogin = (req, res) => {
  res.render("login.html", { error: null });
};

// Procesar login
export const procesarLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findOne({ username });

    // Verificar si existe el usuario y si la contraseña es correcta
    if (!usuario || !(await usuario.compararPassword(password))) {
      return res.render("login.html", {
        error: "Credenciales inválidas. Por favor, verifica tu usuario y contraseña.",
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { usuario: usuario.username, id: usuario._id, admin: usuario.admin },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Enviar cookie con el token
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.IN === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    }).redirect("/");

  } catch (error) {
    console.error("Error en login:", error);
    res.render("login.html", {
      error: "Error al procesar el login. Por favor, intenta de nuevo.",
    });
  }
};

// Mostrar formulario de registro
export const mostrarRegistro = (req, res) => {
  res.render("registro.html", { error: null });
};

// Procesar registro
export const procesarRegistro = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return res.render("registro.html", {
        error: "Las contraseñas no coinciden.",
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      $or: [{ username }, { email }],
    });

    if (usuarioExistente) {
      return res.render("registro.html", {
        error: "El usuario o email ya está registrado.",
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      username,
      email,
      password, // Se cifrará automáticamente por el hook pre-save
    });

    await nuevoUsuario.save();

    // Generar token JWT
    const token = jwt.sign(
      { usuario: nuevoUsuario.username, id: nuevoUsuario._id, admin: nuevoUsuario.admin },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Enviar cookie con el token y redirigir
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.IN === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    }).redirect("/");

  } catch (error) {
    console.error("Error en registro:", error);

    // Manejar errores de validación de Mongoose
    if (error.name === "ValidationError") {
      const mensajesError = Object.values(error.errors).map(err => err.message).join(", ");
      return res.render("registro.html", {
        error: mensajesError,
      });
    }

    res.render("registro.html", {
      error: "Error al procesar el registro. Por favor, intenta de nuevo.",
    });
  }
};

// Cerrar sesión
export const logout = (req, res) => {
  res.clearCookie("access_token").redirect("/");
};
