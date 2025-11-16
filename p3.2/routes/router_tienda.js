// ./routes/router_tienda.js
import express from "express";
import * as productosController from "../controllers/productosController.js";
import * as carritoController from "../controllers/carritoController.js";
import { inicializarCarrito } from "../middlewares/carritoMiddleware.js";

const router = express.Router();

// Middleware para inicializar carrito en todas las rutas
router.use(inicializarCarrito);

// ==================== RUTAS DE PRODUCTOS ====================

// Portada
router.get('/', productosController.mostrarPortada);

// Listado de productos con filtros
router.get('/productos', productosController.listarProductos);

// API de productos paginados (lazy loading)
router.get('/api/productos', productosController.obtenerProductosPaginados);

// Detalle de producto individual
router.get('/producto/:id', productosController.mostrarDetalleProducto);

// API de búsqueda
router.get('/api/buscar', productosController.buscarProductos);

// API para cambiar precio (solo admin)
router.put('/api/productos/:id/precio', productosController.cambiarPrecio);

// ==================== RUTAS DEL CARRITO ====================

// Página del carrito
router.get('/carrito', carritoController.mostrarCarrito);

// API: Agregar producto al carrito
router.post('/api/carrito/agregar/:productId', carritoController.agregarProductoAPI);

// API: Incrementar cantidad
router.post('/api/carrito/incrementar/:productId', carritoController.incrementarCantidadAPI);

// API: Decrementar cantidad
router.post('/api/carrito/decrementar/:productId', carritoController.decrementarCantidadAPI);

// API: Eliminar producto
router.post('/api/carrito/eliminar/:productId', carritoController.eliminarProductoAPI);

// ==================== RUTAS LEGACY (redirect - compatibilidad) ====================

// Agregar producto (redirect)
router.get('/al_carrito/:productId', carritoController.agregarProductoRedirect);

// Incrementar cantidad (redirect)
router.get('/incrementar_cantidad/:productId', carritoController.incrementarCantidadRedirect);

// Decrementar cantidad (redirect)
router.get('/decrementar_cantidad/:productId', carritoController.decrementarCantidadRedirect);

// Eliminar producto (redirect)
router.get('/eliminar_del_carrito/:productId', carritoController.eliminarProductoRedirect);

// Vaciar carrito
router.get('/vaciar_carrito', carritoController.vaciarCarrito);

export default router;
