// admin.js - Funcionalidades de administración

let modalCambiarPrecio;
let productoActualId = null;

// Inicializar modal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  const modalElement = document.getElementById('modalCambiarPrecio');
  if (modalElement) {
    modalCambiarPrecio = new bootstrap.Modal(modalElement);

    // Configurar el formulario
    const form = document.getElementById('formCambiarPrecio');
    if (form) {
      form.addEventListener('submit', handleSubmitCambiarPrecio);
    }

    // Limpiar el formulario cuando se cierra el modal
    modalElement.addEventListener('hidden.bs.modal', function() {
      limpiarFormularioPrecio();
    });
  }
});

/**
 * Abre el modal para cambiar el precio de un producto
 * @param {string} productoId - ID del producto
 */
async function cambiarPrecio(productoId) {
  try {
    productoActualId = productoId;

    // Obtener los datos actuales del producto
    const response = await fetch(`/producto/${productoId}`);
    const html = await response.text();

    // Parsear el HTML para extraer el precio
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Buscar el precio en el documento
    let precioActual = '';

    // Intentar obtener precio rebajado primero
    const precioRebajado = doc.querySelector('.product-detail-price-sale');
    if (precioRebajado) {
      precioActual = precioRebajado.textContent.trim();
    } else {
      // Si no hay precio rebajado, obtener el precio normal
      const precioNormal = doc.querySelector('.product-detail-price');
      if (precioNormal) {
        precioActual = precioNormal.textContent.trim();
      }
    }

    // Si no encontramos precio en la vista de detalle, hacer petición a la API
    if (!precioActual) {
      const apiResponse = await fetch(`/api/productos?pagina=1&limite=1`);
      const data = await apiResponse.json();
      const producto = data.productos.find(p => p._id === productoId);
      if (producto) {
        precioActual = producto.priceText || `${producto.priceEuros}€`;
      }
    }

    // Actualizar el formulario
    document.getElementById('productoId').value = productoId;
    document.getElementById('precioActual').value = precioActual;
    document.getElementById('nuevoPrecio').value = '';

    // Ocultar mensaje de error si existe
    const errorDiv = document.getElementById('errorCambiarPrecio');
    if (errorDiv) {
      errorDiv.classList.add('d-none');
    }

    // Mostrar el modal
    if (modalCambiarPrecio) {
      modalCambiarPrecio.show();
    }
  } catch (error) {
    console.error('Error al abrir modal de cambio de precio:', error);
    alert('Error al cargar los datos del producto');
  }
}

/**
 * Maneja el envío del formulario para cambiar precio
 * @param {Event} event - Evento del formulario
 */
async function handleSubmitCambiarPrecio(event) {
  event.preventDefault();

  const nuevoPrecio = document.getElementById('nuevoPrecio').value;
  const productoId = document.getElementById('productoId').value;
  const errorDiv = document.getElementById('errorCambiarPrecio');

  // Validar el precio
  if (!nuevoPrecio || isNaN(nuevoPrecio) || parseFloat(nuevoPrecio) < 0) {
    mostrarError('Por favor, ingrese un precio válido');
    return;
  }

  try {
    // Deshabilitar el botón de submit
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const textoOriginal = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    // Hacer la petición PUT para actualizar el precio
    const response = await fetch(`/api/productos/${productoId}/precio`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nuevoPrecio: parseFloat(nuevoPrecio) })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar el precio');
    }

    // Cerrar el modal
    if (modalCambiarPrecio) {
      modalCambiarPrecio.hide();
    }

    // Recargar la página para ver los cambios
    window.location.reload();

  } catch (error) {
    console.error('Error al cambiar precio:', error);
    mostrarError(error.message || 'Error al actualizar el precio');

    // Rehabilitar el botón
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar Cambios';
  }
}

/**
 * Muestra un mensaje de error en el modal
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarError(mensaje) {
  const errorDiv = document.getElementById('errorCambiarPrecio');
  if (errorDiv) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove('d-none');
  }
}

/**
 * Limpia el formulario de cambio de precio
 */
function limpiarFormularioPrecio() {
  const form = document.getElementById('formCambiarPrecio');
  if (form) {
    form.reset();
  }

  const errorDiv = document.getElementById('errorCambiarPrecio');
  if (errorDiv) {
    errorDiv.classList.add('d-none');
    errorDiv.textContent = '';
  }

  productoActualId = null;
}

// Exponer la función cambiarPrecio globalmente para que sea accesible desde Alpine.js y onclick
window.cambiarPrecio = cambiarPrecio;
