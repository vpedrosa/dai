// ./routes/router_tienda.js
import express from "express";
import Producto from "../model/Producto.js";
const router = express.Router();

// Middleware para pasar información del carrito a todas las vistas
router.use((req, res, next) => {
  // Asegurarse de que la sesión existe
  if (!req.session) {
    req.session = {};
  }

  // Inicializar carrito si no existe
  if (!req.session.carrito) {
    req.session.carrito = [];
  }

  // Calcular estadísticas del carrito
  const numProductos = req.session.carrito.reduce((total, item) => {
    return total + item.cantidad;
  }, 0);
  const totalCarrito = req.session.carrito.reduce((total, item) => {
    const precio = item.precioRebajado && item.precioRebajado > 0 ? item.precioRebajado : item.priceEuros;
    return total + (precio * item.cantidad);
  }, 0);

  // Pasar información del carrito a las vistas
  res.locals.carrito = {
    numProductos,
    totalCarrito,
    items: req.session.carrito
  };

  next();
});

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

// Página de detalle de un producto individual
router.get('/producto/:id', async (req, res) => {
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

// API: Añadir producto al carrito (JSON)
router.post('/api/carrito/agregar/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const producto = await Producto.findById(productId);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Inicializar carrito si no existe
    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Buscar si el producto ya está en el carrito
    const itemExistente = req.session.carrito.find(item => item._id.toString() === productId);

    if (itemExistente) {
      // Si ya existe, incrementar cantidad
      itemExistente.cantidad++;
    } else {
      // Si no existe, añadirlo
      req.session.carrito.push({
        _id: producto._id,
        text1: producto.text1,
        text2: producto.text2,
        category: producto.category,
        imageUrl: producto.imageUrl,
        priceText: producto.priceText,
        priceEuros: producto.priceEuros,
        precioRebajado: producto.precioRebajado,
        cantidad: 1
      });
    }

    // Calcular estadísticas actualizadas del carrito
    const numProductos = req.session.carrito.reduce((total, item) => total + item.cantidad, 0);
    const totalCarrito = req.session.carrito.reduce((total, item) => {
      const precio = item.precioRebajado && item.precioRebajado > 0 ? item.precioRebajado : item.priceEuros;
      return total + (precio * item.cantidad);
    }, 0);

    res.json({
      success: true,
      carrito: {
        numProductos,
        totalCarrito,
        items: req.session.carrito
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Añadir producto al carrito (redirect - para compatibilidad)
router.get('/al_carrito/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const producto = await Producto.findById(productId);

    if (!producto) {
      return res.status(404).send('Producto no encontrado');
    }

    // Inicializar carrito si no existe
    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Buscar si el producto ya está en el carrito
    const itemExistente = req.session.carrito.find(item => item._id.toString() === productId);

    if (itemExistente) {
      // Si ya existe, incrementar cantidad
      itemExistente.cantidad++;
    } else {
      // Si no existe, añadirlo
      req.session.carrito.push({
        _id: producto._id,
        text1: producto.text1,
        text2: producto.text2,
        category: producto.category,
        imageUrl: producto.imageUrl,
        priceText: producto.priceText,
        priceEuros: producto.priceEuros,
        precioRebajado: producto.precioRebajado,
        cantidad: 1
      });
    }

    // Redirigir a la página anterior o a productos
    const referer = req.get('Referer') || '/productos';
    res.redirect(referer);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Página del carrito
router.get('/carrito', (req, res) => {
  try {
    // Inicializar carrito si no existe
    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    res.render('carrito.html', {
      items: req.session.carrito
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// API: Incrementar cantidad de un producto en el carrito (JSON)
router.post('/api/carrito/incrementar/:productId', (req, res) => {
  try {
    const productId = req.params.productId;

    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Buscar el producto y aumentar cantidad
    const item = req.session.carrito.find(item => item._id.toString() === productId);
    if (item) {
      item.cantidad++;
    }

    // Calcular estadísticas actualizadas del carrito
    const numProductos = req.session.carrito.reduce((total, item) => total + item.cantidad, 0);
    const totalCarrito = req.session.carrito.reduce((total, item) => {
      const precio = item.precioRebajado && item.precioRebajado > 0 ? item.precioRebajado : item.priceEuros;
      return total + (precio * item.cantidad);
    }, 0);

    res.json({
      success: true,
      carrito: {
        numProductos,
        totalCarrito,
        items: req.session.carrito
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Decrementar cantidad de un producto en el carrito (JSON)
router.post('/api/carrito/decrementar/:productId', (req, res) => {
  try {
    const productId = req.params.productId;

    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Buscar el producto y disminuir cantidad
    const item = req.session.carrito.find(item => item._id.toString() === productId);
    if (item) {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        // Si la cantidad es 1, eliminar el producto del carrito
        req.session.carrito = req.session.carrito.filter(i => i._id.toString() !== productId);
      }
    }

    // Calcular estadísticas actualizadas del carrito
    const numProductos = req.session.carrito.reduce((total, item) => total + item.cantidad, 0);
    const totalCarrito = req.session.carrito.reduce((total, item) => {
      const precio = item.precioRebajado && item.precioRebajado > 0 ? item.precioRebajado : item.priceEuros;
      return total + (precio * item.cantidad);
    }, 0);

    res.json({
      success: true,
      carrito: {
        numProductos,
        totalCarrito,
        items: req.session.carrito
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Incrementar cantidad de un producto en el carrito (redirect - para página carrito)
router.get('/incrementar_cantidad/:productId', (req, res) => {
  try {
    const productId = req.params.productId;

    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Buscar el producto y aumentar cantidad
    const item = req.session.carrito.find(item => item._id.toString() === productId);
    if (item) {
      item.cantidad++;
    }

    // Redirigir a la página anterior o al carrito
    const referer = req.get('Referer') || '/carrito';
    res.redirect(referer);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Decrementar cantidad de un producto en el carrito
router.get('/decrementar_cantidad/:productId', (req, res) => {
  try {
    const productId = req.params.productId;

    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Buscar el producto y disminuir cantidad
    const item = req.session.carrito.find(item => item._id.toString() === productId);
    if (item) {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        // Si la cantidad es 1, eliminar el producto del carrito
        req.session.carrito = req.session.carrito.filter(i => i._id.toString() !== productId);
      }
    }

    // Redirigir a la página anterior o al carrito
    const referer = req.get('Referer') || '/carrito';
    res.redirect(referer);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// API: Eliminar producto del carrito (JSON)
router.post('/api/carrito/eliminar/:productId', (req, res) => {
  try {
    const productId = req.params.productId;

    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Filtrar el carrito para eliminar el producto
    req.session.carrito = req.session.carrito.filter(item => item._id.toString() !== productId);

    // Calcular estadísticas actualizadas del carrito
    const numProductos = req.session.carrito.reduce((total, item) => total + item.cantidad, 0);
    const totalCarrito = req.session.carrito.reduce((total, item) => {
      const precio = item.precioRebajado && item.precioRebajado > 0 ? item.precioRebajado : item.priceEuros;
      return total + (precio * item.cantidad);
    }, 0);

    res.json({
      success: true,
      carrito: {
        numProductos,
        totalCarrito,
        items: req.session.carrito
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar producto del carrito (redirect - para compatibilidad)
router.get('/eliminar_del_carrito/:productId', (req, res) => {
  try {
    const productId = req.params.productId;

    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Filtrar el carrito para eliminar el producto
    req.session.carrito = req.session.carrito.filter(item => item._id.toString() !== productId);

    res.redirect('/carrito');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Vaciar carrito
router.get('/vaciar_carrito', (req, res) => {
  try {
    req.session.carrito = [];
    res.redirect('/carrito');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

export default router;
