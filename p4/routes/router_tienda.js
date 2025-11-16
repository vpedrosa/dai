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

// Detalle de producto individual
router.get('/producto/:id', productosController.mostrarDetalleProducto);

// API de búsqueda
router.get('/api/buscar', productosController.buscarProductos);

// ==================== API RESTful - Práctica 4 ====================

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtener todos los productos
 *     description: Retorna una lista paginada de todos los productos disponibles en la tienda
 *     tags: [Productos]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginacionResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/api/productos', productosController.obtenerProductosPaginados);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     description: Retorna los detalles de un producto específico identificado por su ID
 *     tags: [Productos]
 *     parameters:
 *       - $ref: '#/components/parameters/productId'
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/api/productos/:id', productosController.obtenerProductoPorId);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     description: Crea un nuevo producto en la base de datos
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/api/productos', productosController.crearProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar producto
 *     description: Actualiza los datos de un producto existente (principalmente el precio)
 *     tags: [Productos]
 *     parameters:
 *       - $ref: '#/components/parameters/productId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoPrecio'
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/api/productos/:id', productosController.actualizarProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     description: Elimina un producto de la base de datos identificado por su ID
 *     tags: [Productos]
 *     parameters:
 *       - $ref: '#/components/parameters/productId'
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Producto eliminado correctamente
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/api/productos/:id', productosController.eliminarProducto);

// API para cambiar precio (solo admin - endpoint antiguo)
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
