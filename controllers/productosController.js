// ./controllers/productosController.js
import Producto from '../model/Producto.js';
import logger from '../config/logger.js';

/**
 * Controlador de Productos
 * Gestiona todas las operaciones relacionadas con productos
 */

/**
 * Función auxiliar para elegir productos al azar
 * @param {Number} cantidad - Número de productos a seleccionar
 * @returns {Array} Array de productos aleatorios
 */
async function elegirProductosAleatorios(cantidad = 3) {
  const totalProductos = await Producto.countDocuments({});

  if (totalProductos <= cantidad) {
    return await Producto.find({});
  }

  const indicesAleatorios = new Set();
  while (indicesAleatorios.size < cantidad) {
    const indiceAleatorio = Math.floor(Math.random() * totalProductos);
    indicesAleatorios.add(indiceAleatorio);
  }

  const productosAleatorios = [];
  for (const indice of indicesAleatorios) {
    const producto = await Producto.findOne({}).skip(indice).limit(1);
    if (producto) {
      productosAleatorios.push(producto);
    }
  }

  return productosAleatorios;
}

/**
 * Construye la query de filtrado para productos
 * @param {String} categoria - Categoría a filtrar
 * @param {String} busqueda - Texto de búsqueda
 * @returns {Object} Query de MongoDB
 */
function construirQueryFiltros(categoria, busqueda) {
  const query = {};

  if (categoria) {
    query.category = categoria;
  }

  if (busqueda && busqueda.trim().length > 0) {
    query.$or = [
      { text1: { $regex: busqueda, $options: 'i' } },
      { text2: { $regex: busqueda, $options: 'i' } },
      { category: { $regex: busqueda, $options: 'i' } }
    ];
  }

  return query;
}

/**
 * Muestra la portada con productos aleatorios
 * GET /
 */
export async function mostrarPortada(req, res) {
  try {
    const productos = await elegirProductosAleatorios(3);
    res.render('portada.html', { productos });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

/**
 * Muestra el listado de productos con filtros y lazy loading inicial
 * GET /productos
 */
export async function listarProductos(req, res) {
  try {
    const limite = 12;
    const categoria = req.query.categoria;
    const busqueda = req.query.busqueda;

    const query = construirQueryFiltros(categoria, busqueda);

    // Obtener los primeros productos con filtro aplicado
    const productos = await Producto.find(query).limit(limite);

    // Contar el total de productos con filtro aplicado
    const totalProductos = await Producto.countDocuments(query);

    // Obtener categorías únicas para filtros
    const categorias = await Producto.distinct('category');

    res.render('productos.html', {
      productos,
      categorias,
      totalProductos,
      limite,
      categoriaActiva: categoria || null,
      busquedaActiva: busqueda || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

/**
 * API para cargar más productos (lazy loading) con filtros
 * GET /api/productos
 */
export async function obtenerProductosPaginados(req, res) {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 12;
    const skip = (pagina - 1) * limite;
    const categoria = req.query.categoria;
    const busqueda = req.query.busqueda;

    const query = construirQueryFiltros(categoria, busqueda);

    // Obtener productos con paginación y filtro
    const productos = await Producto.find(query)
      .skip(skip)
      .limit(limite);

    // Contar el total de productos con filtro aplicado
    const totalProductos = await Producto.countDocuments(query);
    const totalPaginas = Math.ceil(totalProductos / limite);

    res.json({
      productos,
      pagina,
      totalPaginas,
      totalProductos,
      tieneMas: pagina < totalPaginas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Muestra el detalle de un producto individual
 * GET /producto/:id
 */
export async function mostrarDetalleProducto(req, res) {
  try {
    const productoId = req.params.id;
    const producto = await Producto.findById(productoId);

    if (!producto) {
      return res.status(404).render('404.html', { mensaje: 'Producto no encontrado' });
    }

    // Obtener productos relacionados (misma categoría, excluyendo el actual)
    const productosRelacionados = await Producto.find({
      category: producto.category,
      _id: { $ne: productoId }
    }).limit(4);

    res.render('producto-detalle.html', {
      producto,
      productosRelacionados
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

/**
 * API de búsqueda de productos (para combobox)
 * GET /api/buscar
 */
export async function buscarProductos(req, res) {
  try {
    const query = req.query.q || '';

    if (!query || query.trim().length === 0) {
      return res.json({ resultados: [] });
    }

    // Buscar en text1, text2 y category con regex case-insensitive
    const resultados = await Producto.find({
      $or: [
        { text1: { $regex: query, $options: 'i' } },
        { text2: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    })
    .limit(10) // Limitar a 10 resultados para el combobox
    .select('text1 text2 category imageUrl priceText precioRebajado priceEuros');

    res.json({ resultados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * API para cambiar el precio y sufijo de un producto (solo admin)
 * PUT /api/productos/:id/precio
 */
export async function cambiarPrecio(req, res) {
  try {
    // Verificar que el usuario es admin
    if (!req.admin) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción'
      });
    }

    const productoId = req.params.id;
    const { nuevoPrecio, nuevoSufijo } = req.body;

    // Validar el nuevo precio
    if (!nuevoPrecio || isNaN(nuevoPrecio) || nuevoPrecio < 0) {
      return res.status(400).json({
        error: 'El precio debe ser un número válido mayor o igual a 0'
      });
    }

    // Buscar el producto
    const producto = await Producto.findById(productoId);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Actualizar el precio
    producto.priceEuros = parseFloat(nuevoPrecio);

    // Actualizar el sufijo si se proporciona
    if (nuevoSufijo !== undefined && nuevoSufijo !== null && nuevoSufijo.trim() !== '') {
      producto.priceText = nuevoSufijo.trim();
    }

    await producto.save();

    res.json({
      success: true,
      mensaje: 'Precio actualizado correctamente',
      producto: {
        _id: producto._id,
        priceEuros: producto.priceEuros,
        priceText: producto.priceText
      }
    });
  } catch (err) {
    logger.error('Error al cambiar precio:', err);
    res.status(500).json({ error: 'Error al actualizar el precio' });
  }
}

// ==================== API RESTful - Práctica 4 ====================

/**
 * API para obtener un producto por ID
 * GET /api/productos/:id
 */
export async function obtenerProductoPorId(req, res) {
  try {
    const productoId = req.params.id;
    logger.info(`GET /api/productos/${productoId} - Obteniendo producto por ID`);

    const producto = await Producto.findById(productoId);

    if (!producto) {
      logger.warn(`Producto no encontrado: ${productoId}`);
      return res.status(404).json({
        error: 'Producto no encontrado',
        id: productoId
      });
    }

    logger.info(`Producto obtenido exitosamente: ${producto.text1} (${productoId})`);
    res.json(producto);
  } catch (err) {
    logger.error('Error al obtener producto:', err);

    // Error de formato de ID inválido
    if (err.name === 'CastError') {
      logger.warn(`ID de producto inválido: ${req.params.id}`);
      return res.status(400).json({
        error: 'ID de producto inválido',
        id: req.params.id
      });
    }

    res.status(500).json({ error: 'Error al obtener el producto' });
  }
}

/**
 * API para crear un nuevo producto
 * POST /api/productos
 */
export async function crearProducto(req, res) {
  try {
    const { nombre, descripcion, precio, imagen, categoria } = req.body;
    logger.info('POST /api/productos - Creando nuevo producto', { nombre, precio, categoria });

    // Validaciones básicas
    if (!nombre || !precio) {
      logger.warn('Intento de crear producto sin nombre o precio');
      return res.status(400).json({
        error: 'Nombre y precio son campos obligatorios'
      });
    }

    if (isNaN(precio) || precio < 0) {
      logger.warn(`Precio inválido: ${precio}`);
      return res.status(400).json({
        error: 'El precio debe ser un número válido mayor o igual a 0'
      });
    }

    // Crear el nuevo producto
    const nuevoProducto = new Producto({
      text1: nombre,
      text2: descripcion || 'Sin descripción',
      priceEuros: parseFloat(precio),
      priceText: '€/ud.',  // Solo el sufijo
      imageUrl: imagen || 'https://via.placeholder.com/300',
      category: categoria || 'Sin categoría',
      subcategory: 'General'
    });

    await nuevoProducto.save();
    logger.info(`Producto creado exitosamente: ${nuevoProducto.text1} (${nuevoProducto._id})`);

    res.status(201).json({
      success: true,
      mensaje: 'Producto creado correctamente',
      producto: nuevoProducto
    });
  } catch (err) {
    logger.error('Error al crear producto:', err);

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Error de validación',
        detalles: err.message
      });
    }

    res.status(500).json({ error: 'Error al crear el producto' });
  }
}

/**
 * API para actualizar un producto (precio y sufijo)
 * PUT /api/productos/:id
 */
export async function actualizarProducto(req, res) {
  try {
    const productoId = req.params.id;
    const { precio, sufijo } = req.body;
    logger.info(`PUT /api/productos/${productoId} - Actualizando producto`);

    // Validar el precio
    if (!precio || isNaN(precio) || precio < 0) {
      logger.warn(`Precio inválido para actualización: ${precio}`);
      return res.status(400).json({
        error: 'El precio debe ser un número válido mayor o igual a 0'
      });
    }

    // Buscar el producto
    const producto = await Producto.findById(productoId);

    if (!producto) {
      logger.warn(`Producto no encontrado para actualizar: ${productoId}`);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const precioAnterior = producto.priceEuros;
    const sufijoAnterior = producto.priceText;

    // Actualizar el precio
    producto.priceEuros = parseFloat(precio);

    // Actualizar el sufijo si se proporciona, sino mantener el actual
    if (sufijo !== undefined && sufijo !== null && sufijo.trim() !== '') {
      producto.priceText = sufijo.trim();
    }

    await producto.save();
    logger.info(`Producto actualizado: ${producto.text1} (${productoId}) - Precio: ${precioAnterior}€ → ${precio}€ | Sufijo: ${sufijoAnterior} → ${producto.priceText}`);

    res.json({
      success: true,
      mensaje: 'Producto actualizado correctamente',
      producto
    });
  } catch (err) {
    logger.error('Error al actualizar producto:', err);

    // Error de formato de ID inválido
    if (err.name === 'CastError') {
      logger.warn(`ID de producto inválido: ${req.params.id}`);
      return res.status(400).json({
        error: 'ID de producto inválido',
        id: req.params.id
      });
    }

    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
}

/**
 * API para eliminar un producto
 * DELETE /api/productos/:id
 */
export async function eliminarProducto(req, res) {
  try {
    const productoId = req.params.id;
    logger.info(`DELETE /api/productos/${productoId} - Eliminando producto`);

    const producto = await Producto.findByIdAndDelete(productoId);

    if (!producto) {
      logger.warn(`Producto no encontrado para eliminar: ${productoId}`);
      return res.status(404).json({
        error: 'Producto no encontrado',
        id: productoId
      });
    }

    logger.info(`Producto eliminado exitosamente: ${producto.text1} (${productoId})`);

    res.json({
      success: true,
      mensaje: 'Producto eliminado correctamente',
      producto: {
        _id: producto._id,
        nombre: producto.text1
      }
    });
  } catch (err) {
    logger.error('Error al eliminar producto:', err);

    // Error de formato de ID inválido
    if (err.name === 'CastError') {
      logger.warn(`ID de producto inválido: ${req.params.id}`);
      return res.status(400).json({
        error: 'ID de producto inválido',
        id: req.params.id
      });
    }

    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
}
