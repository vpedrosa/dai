// ./controllers/carritoController.js
import * as carritoService from '../services/carritoService.js';

/**
 * Controlador del Carrito
 * Gestiona todas las operaciones relacionadas con el carrito de compras
 */

/**
 * API: Agregar producto al carrito
 * POST /api/carrito/agregar/:productId
 */
export async function agregarProductoAPI(req, res) {
  try {
    const productId = req.params.productId;
    const resultado = await carritoService.agregarProducto(req.session, productId);

    if (!resultado.success) {
      return res.status(404).json({ error: resultado.error });
    }

    res.json({
      success: true,
      carrito: resultado.carrito
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Agregar producto al carrito (redirect - compatibilidad)
 * GET /al_carrito/:productId
 */
export async function agregarProductoRedirect(req, res) {
  try {
    const productId = req.params.productId;
    const resultado = await carritoService.agregarProducto(req.session, productId);

    if (!resultado.success) {
      return res.status(404).send(resultado.error);
    }

    const referer = req.get('Referer') || '/productos';
    res.redirect(referer);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

/**
 * API: Incrementar cantidad de un producto
 * POST /api/carrito/incrementar/:productId
 */
export function incrementarCantidadAPI(req, res) {
  try {
    const productId = req.params.productId;
    const resultado = carritoService.incrementarCantidad(req.session, productId);

    if (!resultado.success) {
      return res.status(404).json({ error: resultado.error });
    }

    res.json({
      success: true,
      carrito: resultado.carrito
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Incrementar cantidad de un producto (redirect - compatibilidad)
 * GET /incrementar_cantidad/:productId
 */
export function incrementarCantidadRedirect(req, res) {
  try {
    const productId = req.params.productId;
    carritoService.incrementarCantidad(req.session, productId);

    const referer = req.get('Referer') || '/carrito';
    res.redirect(referer);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

/**
 * API: Decrementar cantidad de un producto
 * POST /api/carrito/decrementar/:productId
 */
export function decrementarCantidadAPI(req, res) {
  try {
    const productId = req.params.productId;
    const resultado = carritoService.decrementarCantidad(req.session, productId);

    res.json({
      success: true,
      carrito: resultado.carrito
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Decrementar cantidad de un producto (redirect - compatibilidad)
 * GET /decrementar_cantidad/:productId
 */
export function decrementarCantidadRedirect(req, res) {
  try {
    const productId = req.params.productId;
    carritoService.decrementarCantidad(req.session, productId);

    const referer = req.get('Referer') || '/carrito';
    res.redirect(referer);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

/**
 * API: Eliminar producto del carrito
 * POST /api/carrito/eliminar/:productId
 */
export function eliminarProductoAPI(req, res) {
  try {
    const productId = req.params.productId;
    const resultado = carritoService.eliminarProducto(req.session, productId);

    if (!resultado.success) {
      return res.status(404).json({ error: resultado.error });
    }

    res.json({
      success: true,
      carrito: resultado.carrito
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Eliminar producto del carrito (redirect - compatibilidad)
 * GET /eliminar_del_carrito/:productId
 */
export function eliminarProductoRedirect(req, res) {
  try {
    const productId = req.params.productId;
    carritoService.eliminarProducto(req.session, productId);

    res.redirect('/carrito');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

/**
 * Vaciar completamente el carrito
 * GET /vaciar_carrito
 */
export function vaciarCarrito(req, res) {
  try {
    carritoService.vaciarCarrito(req.session);
    res.redirect('/carrito');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

/**
 * Mostrar la página del carrito
 * GET /carrito
 */
export function mostrarCarrito(req, res) {
  try {
    const resumen = carritoService.obtenerResumen(req.session);

    res.render('carrito.html', {
      items: resumen.items
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}
