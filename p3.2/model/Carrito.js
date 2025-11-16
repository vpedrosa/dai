// ./model/Carrito.js
/**
 * Modelo del Carrito de Compras
 * No usa MongoDB, representa la estructura y lógica del carrito en sesión
 */

class Carrito {
  constructor(items = []) {
    this.items = items;
  }

  /**
   * Agrega un producto al carrito o incrementa su cantidad si ya existe
   * @param {Object} producto - Producto de MongoDB con todos sus campos
   * @returns {Object} Item del carrito actualizado
   */
  agregarProducto(producto) {
    const itemExistente = this.items.find(
      item => item._id.toString() === producto._id.toString()
    );

    if (itemExistente) {
      itemExistente.cantidad++;
      return itemExistente;
    } else {
      const nuevoItem = {
        _id: producto._id,
        text1: producto.text1,
        text2: producto.text2,
        category: producto.category,
        imageUrl: producto.imageUrl,
        priceText: producto.priceText,
        priceEuros: producto.priceEuros,
        precioRebajado: producto.precioRebajado,
        cantidad: 1
      };
      this.items.push(nuevoItem);
      return nuevoItem;
    }
  }

  /**
   * Incrementa la cantidad de un producto
   * @param {String} productId - ID del producto
   * @returns {Object|null} Item actualizado o null si no se encuentra
   */
  incrementarCantidad(productId) {
    const item = this.items.find(item => item._id.toString() === productId);
    if (item) {
      item.cantidad++;
      return item;
    }
    return null;
  }

  /**
   * Decrementa la cantidad de un producto, elimina si llega a 0
   * @param {String} productId - ID del producto
   * @returns {Object} Resultado con el item y si fue eliminado
   */
  decrementarCantidad(productId) {
    const item = this.items.find(item => item._id.toString() === productId);

    if (!item) {
      return { eliminado: false, item: null };
    }

    if (item.cantidad > 1) {
      item.cantidad--;
      return { eliminado: false, item };
    } else {
      // Eliminar el producto del carrito
      this.items = this.items.filter(i => i._id.toString() !== productId);
      return { eliminado: true, item: null };
    }
  }

  /**
   * Elimina completamente un producto del carrito
   * @param {String} productId - ID del producto
   * @returns {Boolean} true si se eliminó, false si no se encontró
   */
  eliminarProducto(productId) {
    const longitudAntes = this.items.length;
    this.items = this.items.filter(item => item._id.toString() !== productId);
    return this.items.length < longitudAntes;
  }

  /**
   * Vacía completamente el carrito
   */
  vaciar() {
    this.items = [];
  }

  /**
   * Calcula el número total de productos en el carrito
   * @returns {Number} Suma de todas las cantidades
   */
  obtenerNumeroProductos() {
    return this.items.reduce((total, item) => total + item.cantidad, 0);
  }

  /**
   * Calcula el total del carrito considerando precios rebajados
   * @returns {Number} Total en euros
   */
  obtenerTotal() {
    return this.items.reduce((total, item) => {
      const precio = item.precioRebajado && item.precioRebajado > 0
        ? item.precioRebajado
        : item.priceEuros;
      return total + (precio * item.cantidad);
    }, 0);
  }

  /**
   * Obtiene el carrito completo con estadísticas
   * @returns {Object} Objeto con items, numProductos y totalCarrito
   */
  obtenerResumen() {
    return {
      items: this.items,
      numProductos: this.obtenerNumeroProductos(),
      totalCarrito: this.obtenerTotal()
    };
  }

  /**
   * Verifica si un producto está en el carrito
   * @param {String} productId - ID del producto
   * @returns {Boolean}
   */
  tieneProducto(productId) {
    return this.items.some(item => item._id.toString() === productId);
  }

  /**
   * Obtiene la cantidad de un producto específico
   * @param {String} productId - ID del producto
   * @returns {Number} Cantidad del producto (0 si no está)
   */
  obtenerCantidadProducto(productId) {
    const item = this.items.find(item => item._id.toString() === productId);
    return item ? item.cantidad : 0;
  }
}

export default Carrito;
