// busqueda-anticipada.js
// Práctica 5.2 y 5.3: Búsqueda anticipada con TailwindCSS y tarjetas

// Referencias a elementos del DOM
const buscador = document.getElementById('buscador');
const btnLimpiar = document.getElementById('btn-limpiar');
const contadorResultados = document.getElementById('contador-resultados');
const numResultados = document.getElementById('num-resultados');
const tarjetasContainer = document.getElementById('tarjetas');
const sinResultados = document.getElementById('sin-resultados');
const mensajeInicial = document.getElementById('mensaje-inicial');

// Timeout para debounce
let timeoutBusqueda = null;

/**
 * Formatea el precio en formato español (coma decimal)
 * @param {number} precio - Precio en euros
 * @returns {string} Precio formateado
 */
function formatearPrecio(precio) {
    return precio.toFixed(2).replace('.', ',');
}

/**
 * Muestra un producto clonando el template
 * Práctica 5.3: Usa <template> y cloneNode
 * @param {Object} p - Producto a mostrar
 */
function muestraProducto(p) {
    // Obtener la plantilla
    const template = document.getElementById('plantilla');

    // Clonar el contenido del template
    const clonado = template.content.cloneNode(true);

    // Sustituir la información del producto usando data attributes
    const img = clonado.querySelector('[data-img]');
    img.src = p.imageUrl || 'https://via.placeholder.com/300';
    img.alt = p.text1;

    clonado.querySelector('[data-text1]').textContent = p.text1;
    clonado.querySelector('[data-text2]').textContent = p.text2 || '';
    clonado.querySelector('[data-category]').textContent = p.category || '';

    // Mostrar precio (rebajado si existe, sino normal)
    const precioMostrar = p.precioRebajado && p.precioRebajado > 0
        ? p.precioRebajado
        : p.priceEuros;

    clonado.querySelector('[data-precio]').textContent = formatearPrecio(precioMostrar) + ' €';
    clonado.querySelector('[data-precio-texto]').textContent = p.priceText || '';

    // Configurar botón de añadir al carrito
    const btnCarrito = clonado.querySelector('[data-btn-carrito]');
    btnCarrito.addEventListener('click', () => {
        agregarAlCarrito(p._id, btnCarrito);
    });

    // Añadir la tarjeta clonada al contenedor
    tarjetasContainer.appendChild(clonado);
}

/**
 * Agrega un producto al carrito
 * @param {string} productoId - ID del producto
 * @param {HTMLElement} boton - Botón que se pulsó
 */
async function agregarAlCarrito(productoId, boton) {
    const textoOriginal = boton.textContent;
    boton.textContent = 'Añadiendo...';
    boton.disabled = true;

    try {
        const response = await fetch(`/api/carrito/agregar/${productoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            boton.textContent = 'Añadido';
            boton.classList.remove('border-green-600', 'text-green-700', 'hover:bg-green-50');
            boton.classList.add('bg-green-600', 'text-white');

            setTimeout(() => {
                boton.textContent = textoOriginal;
                boton.classList.add('border-green-600', 'text-green-700', 'hover:bg-green-50');
                boton.classList.remove('bg-green-600', 'text-white');
                boton.disabled = false;
            }, 1500);
        } else {
            throw new Error('Error al añadir');
        }
    } catch (error) {
        console.error('Error:', error);
        boton.textContent = 'Error';
        setTimeout(() => {
            boton.textContent = textoOriginal;
            boton.disabled = false;
        }, 1500);
    }
}

/**
 * Limpia las tarjetas del contenedor
 */
function limpiarTarjetas() {
    tarjetasContainer.innerHTML = '';
}

/**
 * Actualiza la UI según el estado
 * @param {string} estado - 'inicial', 'resultados', 'sin-resultados'
 * @param {number} cantidad - Número de resultados (opcional)
 */
function actualizarUI(estado, cantidad = 0) {
    // Ocultar todos los estados
    mensajeInicial.classList.add('hidden');
    sinResultados.classList.add('hidden');
    contadorResultados.classList.add('hidden');

    switch (estado) {
        case 'inicial':
            mensajeInicial.classList.remove('hidden');
            break;
        case 'resultados':
            contadorResultados.classList.remove('hidden');
            numResultados.textContent = cantidad;
            break;
        case 'sin-resultados':
            sinResultados.classList.remove('hidden');
            break;
    }
}

/**
 * Realiza la búsqueda anticipada llamando al API
 * @param {string} texto - Texto a buscar
 */
async function buscar(texto) {
    // Si menos de 3 caracteres, mostrar mensaje inicial
    if (texto.length < 3) {
        limpiarTarjetas();
        actualizarUI('inicial');
        return;
    }

    try {
        // Llamar al endpoint de búsqueda anticipada - Práctica 5.2
        const response = await fetch(`/api/busqueda-anticipada/${encodeURIComponent(texto)}`);
        const productos = await response.json();

        // Limpiar tarjetas anteriores
        limpiarTarjetas();

        if (productos.length === 0) {
            actualizarUI('sin-resultados');
        } else {
            actualizarUI('resultados', productos.length);

            // Mostrar cada producto usando el template - Práctica 5.3
            for (const producto of productos) {
                muestraProducto(producto);
            }
        }
    } catch (error) {
        console.error('Error en búsqueda:', error);
        limpiarTarjetas();
        actualizarUI('sin-resultados');
    }
}

/**
 * Manejador del evento input con debounce
 * @param {Event} evt - Evento input
 */
function handleInput(evt) {
    const texto = evt.target.value.trim();

    // Mostrar/ocultar botón limpiar
    if (texto.length > 0) {
        btnLimpiar.classList.remove('hidden');
    } else {
        btnLimpiar.classList.add('hidden');
    }

    // Cancelar búsqueda anterior si existe
    if (timeoutBusqueda) {
        clearTimeout(timeoutBusqueda);
    }

    // Debounce de 300ms para no hacer demasiadas peticiones
    timeoutBusqueda = setTimeout(() => {
        buscar(texto);
    }, 300);
}

/**
 * Limpia el buscador
 */
function limpiarBuscador() {
    buscador.value = '';
    btnLimpiar.classList.add('hidden');
    limpiarTarjetas();
    actualizarUI('inicial');
    buscador.focus();
}

// Event listeners
buscador.addEventListener('input', handleInput);
btnLimpiar.addEventListener('click', limpiarBuscador);

// Focus inicial en el buscador
buscador.focus();

console.log('busqueda-anticipada.js cargado');
