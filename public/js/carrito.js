/**
 * Operaciones asíncronas del carrito
 */

/**
 * Formatea un número a formato de precio español (0,77€)
 */
function formatearPrecioEspanol(precio) {
  return `${precio.toFixed(2).replace('.', ',')}€`;
}

/**
 * Actualiza el contador del carrito en el header
 */
function actualizarHeaderCarrito(carrito) {
  const cartLink = document.querySelector('.nav-link[href="/carrito"]');
  if (!cartLink) return;

  // Limpiar contenido existente
  const iconoCarrito = '<i class="bi bi-cart"></i> Carrito';

  if (carrito.numProductos > 0) {
    cartLink.classList.add('cart-with-items');
    cartLink.innerHTML = `
      ${iconoCarrito}
      <span class="badge bg-primary ms-1">${carrito.numProductos}</span>
      <span class="cart-total ms-2">${formatearPrecioEspanol(carrito.totalCarrito)}</span>
    `;
  } else {
    cartLink.classList.remove('cart-with-items');
    cartLink.innerHTML = iconoCarrito;
  }
}

/**
 * Añadir producto al carrito de forma asíncrona
 */
async function agregarAlCarrito(productId, button) {
  try {
    // Deshabilitar botón temporalmente
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Agregando...';

    const response = await fetch(`/api/carrito/agregar/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      // Actualizar header
      actualizarHeaderCarrito(data.carrito);

      // Mostrar feedback visual
      button.classList.remove('btn-primary');
      button.classList.add('btn-success');
      button.innerHTML = '<i class="bi bi-check"></i> ¡Añadido!';

      // Buscar el producto añadido en el carrito
      const itemAñadido = data.carrito.items.find(item => item._id === productId);

      // Reemplazar el botón por controles de cantidad
      setTimeout(() => {
        const parent = button.parentElement;
        const controles = crearControlesDeQuantidad(productId, itemAñadido.cantidad);
        parent.replaceChild(controles, button);
      }, 500);
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
}

/**
 * Crear controles de cantidad para reemplazar el botón de añadir
 */
function crearControlesDeQuantidad(productId, cantidad, esDetalle = false) {
  const containerId = `controls-${productId}`;
  const displayId = `display-${productId}`;

  if (esDetalle) {
    // Para página de detalle - layout más elaborado
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="d-flex align-items-center gap-3 mb-3">
        <label class="form-label mb-0 fw-bold">Cantidad en carrito:</label>
        <div class="quantity-controls-detail" id="${containerId}">
          <button type="button"
                  class="btn btn-outline-secondary quantity-btn"
                  title="Disminuir cantidad"
                  onclick="decrementarCantidad('${productId}', document.getElementById('${displayId}'))">
              <i class="bi bi-dash"></i>
          </button>
          <span class="quantity-display-large" id="${displayId}">${cantidad}</span>
          <button type="button"
                  class="btn btn-outline-secondary quantity-btn"
                  title="Aumentar cantidad"
                  onclick="incrementarCantidad('${productId}', document.getElementById('${displayId}'))">
              <i class="bi bi-plus"></i>
          </button>
        </div>
      </div>
      <a href="/carrito" class="btn btn-primary btn-lg">
        <i class="bi bi-cart-check me-2"></i>
        Ver carrito
      </a>
    `;
    return wrapper;
  } else {
    // Para cards de productos - layout compacto
    const container = document.createElement('div');
    container.className = 'quantity-controls-card';
    container.id = containerId;

    container.innerHTML = `
      <button type="button"
              class="btn btn-sm btn-outline-secondary quantity-btn"
              title="Disminuir cantidad"
              onclick="decrementarCantidad('${productId}', document.getElementById('${displayId}'))">
          <i class="bi bi-dash"></i>
      </button>
      <span class="quantity-display" id="${displayId}">${cantidad}</span>
      <button type="button"
              class="btn btn-sm btn-outline-secondary quantity-btn"
              title="Aumentar cantidad"
              onclick="incrementarCantidad('${productId}', document.getElementById('${displayId}'))">
          <i class="bi bi-plus"></i>
      </button>
    `;

    return container;
  }
}

/**
 * Añadir producto al carrito desde la página de detalle
 */
async function agregarAlCarritoDetalle(productId, button) {
  try {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Agregando...';

    const response = await fetch(`/api/carrito/agregar/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      // Actualizar header
      actualizarHeaderCarrito(data.carrito);

      // Mostrar feedback visual
      button.classList.remove('btn-primary');
      button.classList.add('btn-success');
      button.innerHTML = '<i class="bi bi-check"></i> ¡Añadido!';

      // Buscar el producto añadido en el carrito
      const itemAñadido = data.carrito.items.find(item => item._id === productId);

      // Reemplazar el botón por controles de cantidad (versión detalle)
      setTimeout(() => {
        const parent = button.parentElement;
        const controles = crearControlesDeQuantidad(productId, itemAñadido.cantidad, true);
        parent.innerHTML = '';
        parent.appendChild(controles);
      }, 500);
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
}

/**
 * Incrementar cantidad de un producto en el carrito
 */
async function incrementarCantidad(productId, displayElement) {
  try {
    const response = await fetch(`/api/carrito/incrementar/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      // Actualizar header
      actualizarHeaderCarrito(data.carrito);

      // Actualizar cantidad en pantalla
      const item = data.carrito.items.find(i => i._id === productId);
      if (item && displayElement) {
        displayElement.textContent = item.cantidad;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Decrementar cantidad de un producto en el carrito
 */
async function decrementarCantidad(productId, displayElement) {
  try {
    const response = await fetch(`/api/carrito/decrementar/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      // Actualizar header
      actualizarHeaderCarrito(data.carrito);

      // Verificar si el producto aún está en el carrito
      const item = data.carrito.items.find(i => i._id === productId);

      if (item && displayElement) {
        // Actualizar cantidad
        displayElement.textContent = item.cantidad;
      } else {
        // El producto fue eliminado, recargar página para mostrar botón "Añadir"
        window.location.reload();
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Actualizar subtotal de una fila en la página del carrito
 */
function actualizarSubtotalFila(productId, cantidad, precio) {
  const subtotal = cantidad * precio;
  const subtotalElement = document.getElementById(`subtotal-${productId}`);
  if (subtotalElement) {
    subtotalElement.textContent = formatearPrecioEspanol(subtotal);
  }
}

/**
 * Calcular y actualizar el total general del carrito
 */
function actualizarTotalCarrito() {
  let total = 0;
  const filas = document.querySelectorAll('tbody tr[id^="row-"]');

  filas.forEach(fila => {
    const productId = fila.id.replace('row-', '');
    const qtyElement = document.getElementById(`qty-${productId}`);
    const precio = parseFloat(fila.dataset.precio);

    if (qtyElement) {
      const cantidad = parseInt(qtyElement.textContent);
      total += cantidad * precio;
    }
  });

  // Actualizar el resumen
  const subtotalElement = document.getElementById('resumen-subtotal');
  const totalElement = document.getElementById('resumen-total');

  if (subtotalElement) {
    subtotalElement.textContent = formatearPrecioEspanol(total);
  }
  if (totalElement) {
    totalElement.textContent = formatearPrecioEspanol(total);
  }
}

/**
 * Incrementar cantidad en la página del carrito
 */
async function incrementarCantidadCarrito(productId) {
  try {
    const response = await fetch(`/api/carrito/incrementar/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.success) {
      // Actualizar header
      actualizarHeaderCarrito(data.carrito);

      // Actualizar cantidad en la tabla
      const qtyElement = document.getElementById(`qty-${productId}`);
      const item = data.carrito.items.find(i => i._id === productId);

      if (item && qtyElement) {
        qtyElement.textContent = item.cantidad;

        // Actualizar subtotal de la fila
        const fila = document.getElementById(`row-${productId}`);
        const precio = parseFloat(fila.dataset.precio);
        actualizarSubtotalFila(productId, item.cantidad, precio);

        // Actualizar total general
        actualizarTotalCarrito();
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Decrementar cantidad en la página del carrito
 */
async function decrementarCantidadCarrito(productId) {
  try {
    const response = await fetch(`/api/carrito/decrementar/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.success) {
      // Actualizar header
      actualizarHeaderCarrito(data.carrito);

      // Verificar si el producto aún está en el carrito
      const item = data.carrito.items.find(i => i._id === productId);

      if (item) {
        // Actualizar cantidad en la tabla
        const qtyElement = document.getElementById(`qty-${productId}`);
        if (qtyElement) {
          qtyElement.textContent = item.cantidad;

          // Actualizar subtotal de la fila
          const fila = document.getElementById(`row-${productId}`);
          const precio = parseFloat(fila.dataset.precio);
          actualizarSubtotalFila(productId, item.cantidad, precio);

          // Actualizar total general
          actualizarTotalCarrito();
        }
      } else {
        // El producto fue eliminado (cantidad llegó a 0), eliminar fila con animación
        const fila = document.getElementById(`row-${productId}`);
        if (fila) {
          fila.style.transition = 'opacity 0.3s ease';
          fila.style.opacity = '0';
          setTimeout(() => {
            fila.remove();
            actualizarTotalCarrito();

            // Si no quedan productos, recargar para mostrar mensaje de carrito vacío
            if (data.carrito.items.length === 0) {
              window.location.reload();
            }
          }, 300);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Eliminar producto del carrito
 */
async function eliminarDelCarrito(productId) {
  try {
    const response = await fetch(`/api/carrito/eliminar/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.success) {
      // Actualizar header
      actualizarHeaderCarrito(data.carrito);

      // Eliminar fila con animación
      const fila = document.getElementById(`row-${productId}`);
      if (fila) {
        fila.style.transition = 'opacity 0.3s ease';
        fila.style.opacity = '0';
        setTimeout(() => {
          fila.remove();
          actualizarTotalCarrito();

          // Si no quedan productos, recargar para mostrar mensaje de carrito vacío
          if (data.carrito.items.length === 0) {
            window.location.reload();
          }
        }, 300);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
