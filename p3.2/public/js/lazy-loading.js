/**
 * Lazy Loading con Infinite Scroll para la lista de productos usando Alpine.js
 */

/**
 * Formatea un número a formato de precio español (0,77€)
 */
function formatearPrecioEspanol(precio) {
  return `${precio.toFixed(2).replace('.', ',')}€`;
}

/**
 * Componente Alpine.js para Lazy Loading
 */
function lazyLoadingComponent(productosIniciales, categoriaActiva, busquedaActiva, carritoItems) {
  return {
    productos: productosIniciales || [],
    paginaActual: 1,
    cargando: false,
    hayMasProductos: true,
    limite: 12,
    categoriaActiva: (categoriaActiva && categoriaActiva !== 'null') ? categoriaActiva : null,
    busquedaActiva: (busquedaActiva && busquedaActiva !== 'null') ? busquedaActiva : null,
    carrito: carritoItems || [],

    init() {
      // Actualizar contador inicial
      this.actualizarContador();
    },

    // Verifica si un producto está en el carrito
    productoEnCarrito(productoId) {
      return this.carrito.find(item => item._id === productoId);
    },

    // Obtiene la cantidad de un producto en el carrito
    getCantidadEnCarrito(productoId) {
      const item = this.productoEnCarrito(productoId);
      return item ? item.cantidad : 0;
    },

    checkScroll() {
      if (this.debeCargarMas()) {
        this.cargarMasProductos();
      }
    },

    debeCargarMas() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanciaDelFinal = documentHeight - (scrollTop + windowHeight);

      return scrollTop > 0 && distanciaDelFinal < 100 && !this.cargando && this.hayMasProductos;
    },

    async cargarMasProductos() {
      if (this.cargando || !this.hayMasProductos) return;

      this.cargando = true;

      try {
        this.paginaActual++;

        let url = `/api/productos?pagina=${this.paginaActual}&limite=${this.limite}`;
        if (this.categoriaActiva && this.categoriaActiva !== 'null') {
          url += `&categoria=${encodeURIComponent(this.categoriaActiva)}`;
        }
        if (this.busquedaActiva && this.busquedaActiva !== 'null') {
          url += `&busqueda=${encodeURIComponent(this.busquedaActiva)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.productos && data.productos.length > 0) {
          this.productos = [...this.productos, ...data.productos];
          this.actualizarContador();
        }

        this.hayMasProductos = data.tieneMas;
      } catch (error) {
        console.error('Error cargando productos:', error);
        this.paginaActual--;
        this.hayMasProductos = false;
      } finally {
        this.cargando = false;
      }
    },

    actualizarContador() {
      this.$nextTick(() => {
        const contadorElement = document.getElementById('productos-cargados');
        if (contadorElement) {
          contadorElement.textContent = this.productos.length;
        }
      });
    },

    formatearPrecio(precio) {
      return formatearPrecioEspanol(precio);
    },

    // Métodos para interactuar con el carrito de forma asíncrona
    async agregarAlCarrito(productId, button) {
      try {
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Agregando...';

        const response = await fetch(`/api/carrito/agregar/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.success) {
          // Actualizar el estado local del carrito
          this.carrito = data.carrito.items;

          // Actualizar header
          actualizarHeaderCarrito(data.carrito);

          // Feedback visual temporal
          button.classList.remove('btn-primary');
          button.classList.add('btn-success');
          button.innerHTML = '<i class="bi bi-check"></i> ¡Añadido!';

          // Los controles aparecerán automáticamente gracias a Alpine.js
        } else {
          throw new Error(data.error || 'Error al añadir al carrito');
        }
      } catch (error) {
        console.error('Error:', error);
        button.classList.add('btn-danger');
        button.innerHTML = '<i class="bi bi-x"></i> Error';

        setTimeout(() => {
          button.classList.remove('btn-danger');
          button.disabled = false;
          button.innerHTML = originalText;
        }, 2000);
      }
    },

    async incrementarCantidad(productId, displayElement) {
      try {
        const response = await fetch(`/api/carrito/incrementar/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.success) {
          // Actualizar el estado local del carrito
          this.carrito = data.carrito.items;

          // Actualizar header
          actualizarHeaderCarrito(data.carrito);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },

    async decrementarCantidad(productId, displayElement) {
      try {
        const response = await fetch(`/api/carrito/decrementar/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.success) {
          // Actualizar el estado local del carrito
          this.carrito = data.carrito.items;

          // Actualizar header
          actualizarHeaderCarrito(data.carrito);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
}
