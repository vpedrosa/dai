// ./routes/router_tienda.js
import express from "express";
import Producto from "../model/Producto.js";
const router = express.Router();

/**
 * Función auxiliar para elegir 3 productos al azar
 * Para nota: hace una consulta para obtener el número total de productos
 * y luego selecciona 3 índices aleatorios
 */
async function elegirTresProductosAleatorios() {
  // Obtener el número total de productos
  const totalProductos = await Producto.countDocuments({});

  if (totalProductos <= 3) {
    // Si hay 3 o menos productos, devolver todos
    return await Producto.find({});
  }

  // Generar 3 índices aleatorios únicos
  const indicesAleatorios = new Set();
  while (indicesAleatorios.size < 3) {
    const indiceAleatorio = Math.floor(Math.random() * totalProductos);
    indicesAleatorios.add(indiceAleatorio);
  }

  // Obtener los productos en los índices aleatorios
  const productosAleatorios = [];
  for (const indice of indicesAleatorios) {
    const producto = await Producto.findOne({}).skip(indice).limit(1);
    if (producto) {
      productosAleatorios.push(producto);
    }
  }

  return productosAleatorios;
}

// Portada en /
router.get('/', async (req, res) => {
  try {
    // Elegir 3 productos al azar
    const productos = await elegirTresProductosAleatorios();

    res.render('portada.html', { productos });    // ../views/portada.html
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Listado de productos con lazy loading inicial y filtros
router.get('/productos', async (req, res) => {
  try {
    const limite = 12; // Número de productos por página
    const categoria = req.query.categoria; // Filtro por categoría
    const busqueda = req.query.busqueda; // Búsqueda de texto

    // Construir query de filtrado
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
});

// API endpoint para cargar más productos (lazy loading) con filtros
router.get('/api/productos', async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 12;
    const skip = (pagina - 1) * limite;
    const categoria = req.query.categoria; // Filtro por categoría
    const busqueda = req.query.busqueda; // Búsqueda de texto

    // Construir query de filtrado
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
});

// Endpoint de búsqueda de productos (para el combobox)
router.get('/api/buscar', async (req, res) => {
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
});

export default router;
