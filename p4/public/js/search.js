/**
 * Componente de búsqueda con Alpine.js
 * Incluye debounce de 300ms y gestión de estado reactivo
 */

/**
 * Formatea un número a formato de precio español (0,77€)
 */
function formatearPrecioEspanol(precio) {
  return `${precio.toFixed(2).replace('.', ',')}€`;
}

/**
 * Formatea el precio completo con sufijo (13,70 €/ud.)
 */
function formatearPrecioConSufijo(precioNumero, sufijo) {
  const precioFormateado = precioNumero.toFixed(2).replace('.', ',');
  return `${precioFormateado} ${sufijo || '€/ud.'}`;
}

function searchComponent() {
  return {
    searchQuery: '',
    resultados: [],
    open: false,
    cargando: false,
    focusedIndex: -1,

    async buscar() {
      // Si la query está vacía, limpiar resultados
      if (!this.searchQuery || this.searchQuery.trim().length === 0) {
        this.resultados = [];
        this.open = false;
        return;
      }

      this.cargando = true;
      this.open = true;

      try {
        const response = await fetch(`/api/buscar?q=${encodeURIComponent(this.searchQuery)}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.resultados = data.resultados || [];
        this.focusedIndex = -1;
      } catch (error) {
        console.error('Error buscando productos:', error);
        this.resultados = [];
      } finally {
        this.cargando = false;
      }
    },

    focusNext() {
      if (this.focusedIndex < this.resultados.length - 1) {
        this.focusedIndex++;
      }
    },

    focusPrev() {
      if (this.focusedIndex > 0) {
        this.focusedIndex--;
      }
    },

    irABusqueda() {
      if (this.searchQuery && this.searchQuery.trim().length > 0) {
        window.location.href = `/productos?busqueda=${encodeURIComponent(this.searchQuery.trim())}`;
      }
    },

    formatearPrecio(precio) {
      return formatearPrecioEspanol(precio);
    }
  };
}
