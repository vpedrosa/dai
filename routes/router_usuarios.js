// ./routes/router_usuarios.js
import express from "express";
import {
  mostrarLogin,
  procesarLogin,
  mostrarRegistro,
  procesarRegistro,
  logout,
} from "../controllers/usuariosController.js";

const router = express.Router();

// Rutas de login
router.get("/login", mostrarLogin);
router.post("/login", procesarLogin);

// Rutas de registro
router.get("/registro", mostrarRegistro);
router.post("/registro", procesarRegistro);

// Ruta de logout
router.get("/logout", logout);

export default router;
