// admin.js - Funcionalidades de administración

let modalCambiarPrecio;
let productoActualId = null;
let productoActualSufijo = '€/ud.';

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

    // Añadir listeners para vista previa en tiempo real
    const nuevoPrecioInput = document.getElementById('nuevoPrecio');
    const nuevoSufijoInput = document.getElementById('nuevoSufijo');
    if (nuevoPrecioInput && nuevoSufijoInput) {
      nuevoPrecioInput.addEventListener('input', actualizarVistaPrevia);
      nuevoSufijoInput.addEventListener('input', actualizarVistaPrevia);
    }
  }
});

/**
 * Abre el modal para cambiar el precio de un producto
 * @param {string} productoId - ID del producto
 */
async function cambiarPrecio(productoId) {
  try {
    productoActualId = productoId;

    // Obtener los datos del producto desde la API
    const apiResponse = await fetch(`/api/productos/${productoId}`);
    const producto = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error('No se pudo obtener el producto');
    }

    // Guardar sufijo actual
    productoActualSufijo = producto.priceText || '€/ud.';

    // Formatear precio para mostrar
    const precioFormateado = `${producto.priceEuros.toFixed(2).replace('.', ',')} ${producto.priceText}`;

    // Actualizar el formulario
    document.getElementById('productoId').value = productoId;
    document.getElementById('precioActual').value = precioFormateado;
    document.getElementById('nuevoPrecio').value = producto.priceEuros;
    document.getElementById('nuevoSufijo').value = producto.priceText;

    // Actualizar vista previa
    actualizarVistaPrevia();

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
 * Actualiza la vista previa del precio
 */
function actualizarVistaPrevia() {
  const nuevoPrecioInput = document.getElementById('nuevoPrecio');
  const nuevoSufijoInput = document.getElementById('nuevoSufijo');
  const vistaPreviaInput = document.getElementById('vistaPrevia');

  if (!nuevoPrecioInput || !nuevoSufijoInput || !vistaPreviaInput) return;

  const precio = parseFloat(nuevoPrecioInput.value) || 0;
  const sufijo = nuevoSufijoInput.value || '€/ud.';

  // Formatear precio con coma decimal estilo español
  const precioFormateado = precio.toFixed(2).replace('.', ',');
  vistaPreviaInput.value = `${precioFormateado} ${sufijo}`;
}

/**
 * Maneja el envío del formulario para cambiar precio
 * @param {Event} event - Evento del formulario
 */
async function handleSubmitCambiarPrecio(event) {
  event.preventDefault();

  const nuevoPrecio = document.getElementById('nuevoPrecio').value;
  const nuevoSufijo = document.getElementById('nuevoSufijo').value;
  const productoId = document.getElementById('productoId').value;
  const errorDiv = document.getElementById('errorCambiarPrecio');

  // Validar el precio
  if (!nuevoPrecio || isNaN(nuevoPrecio) || parseFloat(nuevoPrecio) < 0) {
    mostrarError('Por favor, ingrese un precio válido');
    return;
  }

  // Validar el sufijo
  if (!nuevoSufijo || nuevoSufijo.trim() === '') {
    mostrarError('Por favor, ingrese un sufijo válido');
    return;
  }

  try {
    // Deshabilitar el botón de submit
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const textoOriginal = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    // Hacer la petición PUT para actualizar el precio y sufijo
    const response = await fetch(`/api/productos/${productoId}/precio`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nuevoPrecio: parseFloat(nuevoPrecio),
        nuevoSufijo: nuevoSufijo.trim()
      })
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
