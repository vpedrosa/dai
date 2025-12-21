// ./services/carritoService.js
import Carrito from '../model/Carrito.js';
import Producto from '../model/Producto.js';

/**
 * Servicio del Carrito
 * Encapsula la lógica de negocio del carrito de compras
 */

/**
 * Obtiene el carrito de la sesión o crea uno nuevo
 * @param {Object} session - Objeto de sesión de Express
 * @returns {Carrito} Instancia del carrito
 */
export function obtenerCarrito(session) {
  if (!session.carrito) {
    session.carrito = [];
  }
  return new Carrito(session.carrito);
}

/**
 * Guarda el carrito en la sesión
 * @param {Object} session - Objeto de sesión de Express
 * @param {Carrito} carrito - Instancia del carrito
 */
export function guardarCarrito(session, carrito) {
  session.carrito = carrito.items;
}

/**
 * Agrega un producto al carrito
 * @param {Object} session - Objeto de sesión de Express
 * @param {String} productId - ID del producto
 * @returns {Object} Resultado con success y resumen del carrito
 */
export async function agregarProducto(session, productId) {
  try {
    const producto = await Producto.findById(productId);

    if (!producto) {
      return { success: false, error: 'Producto no encontrado' };
    }

    const carrito = obtenerCarrito(session);
    carrito.agregarProducto(producto);
    guardarCarrito(session, carrito);

    return {
      success: true,
      carrito: carrito.obtenerResumen()
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Incrementa la cantidad de un producto
 * @param {Object} session - Objeto de sesión de Express
 * @param {String} productId - ID del producto
 * @returns {Object} Resultado con success y resumen del carrito
 */
export function incrementarCantidad(session, productId) {
  try {
    const carrito = obtenerCarrito(session);
    const item = carrito.incrementarCantidad(productId);

    if (!item) {
      return { success: false, error: 'Producto no encontrado en el carrito' };
    }

    guardarCarrito(session, carrito);

    return {
      success: true,
      carrito: carrito.obtenerResumen()
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Decrementa la cantidad de un producto
 * @param {Object} session - Objeto de sesión de Express
 * @param {String} productId - ID del producto
 * @returns {Object} Resultado con success y resumen del carrito
 */
export function decrementarCantidad(session, productId) {
  try {
    const carrito = obtenerCarrito(session);
    const resultado = carrito.decrementarCantidad(productId);

    guardarCarrito(session, carrito);

    return {
      success: true,
      carrito: carrito.obtenerResumen(),
      eliminado: resultado.eliminado
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un producto del carrito
 * @param {Object} session - Objeto de sesión de Express
 * @param {String} productId - ID del producto
 * @returns {Object} Resultado con success y resumen del carrito
 */
export function eliminarProducto(session, productId) {
  try {
    const carrito = obtenerCarrito(session);
    const eliminado = carrito.eliminarProducto(productId);

    if (!eliminado) {
      return { success: false, error: 'Producto no encontrado en el carrito' };
    }

    guardarCarrito(session, carrito);

    return {
      success: true,
      carrito: carrito.obtenerResumen()
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Vacía completamente el carrito
 * @param {Object} session - Objeto de sesión de Express
 * @returns {Object} Resultado con success
 */
export function vaciarCarrito(session) {
  try {
    const carrito = obtenerCarrito(session);
    carrito.vaciar();
    guardarCarrito(session, carrito);

    return {
      success: true,
      carrito: carrito.obtenerResumen()
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene el resumen del carrito
 * @param {Object} session - Objeto de sesión de Express
 * @returns {Object} Resumen del carrito
 */
export function obtenerResumen(session) {
  const carrito = obtenerCarrito(session);
  return carrito.obtenerResumen();
}
