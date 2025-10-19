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
function lazyLoadingComponent(productosIniciales, categoriaActiva, busquedaActiva) {
  return {
    productos: productosIniciales || [],
    paginaActual: 1,
    cargando: false,
    hayMasProductos: true,
    limite: 12,
    categoriaActiva: (categoriaActiva && categoriaActiva !== 'null') ? categoriaActiva : null,
    busquedaActiva: (busquedaActiva && busquedaActiva !== 'null') ? busquedaActiva : null,

    init() {
      // Actualizar contador inicial
      this.actualizarContador();
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
    }
  };
}
