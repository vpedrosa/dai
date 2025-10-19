// ./controllers/productosController.js
import Producto from '../model/Producto.js';

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
