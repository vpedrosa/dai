// ./middlewares/carritoMiddleware.js
import * as carritoService from '../services/carritoService.js';

/**
 * Middleware para inicializar el carrito y pasar información a las vistas
 * Este middleware se ejecuta en cada petición para asegurar que:
 * 1. La sesión existe
 * 2. El carrito está inicializado
 * 3. Las vistas tienen acceso a la información del carrito
 */
export function inicializarCarrito(req, res, next) {
  // Asegurarse de que la sesión existe
  if (!req.session) {
    req.session = {};
  }

  // Inicializar carrito si no existe
  if (!req.session.carrito) {
    req.session.carrito = [];
  }

  // Obtener resumen del carrito usando el servicio
  const resumen = carritoService.obtenerResumen(req.session);

  // Pasar información del carrito a las vistas mediante res.locals
  res.locals.carrito = resumen;

  next();
}
