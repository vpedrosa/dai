// cambio-precio.js
// Práctica 5.1: DOM, botón para cambiar precios

/**
 * Manejador de eventos para cambiar el precio de un producto
 * @param {Event} evt - Evento click del botón
 */
const cambiar_precio = (evt) => {
    const botón = evt.target.closest('.btn-cambiar-precio'); // elemento al que se ha hecho click

    // Identificar a qué producto pertenece usando atributos data
    const productoId = botón.dataset.productoId;

    // Identificar el <input> que le corresponde
    const inputPrecio = document.querySelector(`input[data-precio-producto="${productoId}"]`);

    if (!inputPrecio) {
        console.error('No se encontró el input de precio para el producto:', productoId);
        return;
    }

    // Tomar el valor de entrada del input
    const nuevoPrecio = parseFloat(inputPrecio.value);

    // Validar el precio
    if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
        mostrarMensaje(botón, 'Precio inválido', 'error');
        return;
    }

    // Deshabilitar el botón mientras se procesa
    botón.disabled = true;
    const textoOriginal = botón.textContent;
    botón.textContent = 'Guardando...';

    // Enviar la llamada PUT al API
    fetch(`/api/productos/${productoId}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ precio: nuevoPrecio })
    })
        .then(res => res.json())
        .then(res => {
            console.log(res);
            if (res.success) {
                // Poner el precio actualizado
                const precioFormateado = nuevoPrecio.toFixed(2).replace('.', ',');
                inputPrecio.value = nuevoPrecio;

                // Actualizar el display del precio en la tarjeta
                const displayPrecio = document.querySelector(`[data-display-precio="${productoId}"]`);
                if (displayPrecio) {
                    displayPrecio.textContent = `${precioFormateado} ${res.producto.priceText || '€/ud.'}`;
                }

                mostrarMensaje(botón, 'Precio actualizado', 'success');
            } else {
                mostrarMensaje(botón, res.error || 'Error al actualizar', 'error');
            }
        })
        .catch(err => {
            console.error(err);
            // Poner mensaje de error
            mostrarMensaje(botón, 'Error de conexión', 'error');
        })
        .finally(() => {
            // Rehabilitar el botón
            botón.disabled = false;
            botón.textContent = textoOriginal;
        });
};

/**
 * Muestra un mensaje temporal junto al botón
 * @param {HTMLElement} botón - El botón junto al cual mostrar el mensaje
 * @param {string} mensaje - El mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje: 'success' o 'error'
 */
function mostrarMensaje(botón, mensaje, tipo) {
    // Buscar o crear el contenedor de mensaje
    let mensajeEl = botón.parentElement.querySelector('.mensaje-precio');

    if (!mensajeEl) {
        mensajeEl = document.createElement('span');
        mensajeEl.className = 'mensaje-precio';
        botón.parentElement.appendChild(mensajeEl);
    }

    // Aplicar estilos según el tipo
    mensajeEl.textContent = mensaje;
    mensajeEl.style.marginLeft = '10px';
    mensajeEl.style.fontSize = '0.85em';
    mensajeEl.style.color = tipo === 'success' ? '#28a745' : '#dc3545';

    // Eliminar el mensaje después de 3 segundos
    setTimeout(() => {
        if (mensajeEl.parentElement) {
            mensajeEl.remove();
        }
    }, 3000);
}

// Obtener todos los botones de cambiar precio usando querySelectorAll
const botones_cambiar_precio = document.querySelectorAll('.btn-cambiar-precio');

// Añadir el event listener a cada botón
for (const botón of botones_cambiar_precio) {
    botón.addEventListener('click', cambiar_precio);
}

console.log(`cambio-precio.js: ${botones_cambiar_precio.length} botones de cambiar precio encontrados`);
