// tests/api.test.js
import request from 'supertest';
import app from '../app.js';
import connectDB from '../model/db.js';
import Producto from '../model/Producto.js';
import mongoose from 'mongoose';

// Conectar a la BD antes de los tests
beforeAll(async () => {
  await connectDB();
});

// Limpiar y cerrar conexión después de los tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('API RESTful - Productos', () => {
  let productoId;
  let productoCreado;

  // ==================== GET /api/productos ====================
  describe('GET /api/productos', () => {
    test('debe devolver todos los productos paginados', async () => {
      const res = await request(app).get('/api/productos');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('productos');
      expect(res.body).toHaveProperty('pagina');
      expect(res.body).toHaveProperty('totalPaginas');
      expect(res.body).toHaveProperty('totalProductos');
      expect(res.body).toHaveProperty('tieneMas');
      expect(Array.isArray(res.body.productos)).toBe(true);
    });

    test('debe respetar el parámetro de paginación', async () => {
      const res = await request(app).get('/api/productos?pagina=1&limite=5');

      expect(res.statusCode).toBe(200);
      expect(res.body.pagina).toBe(1);
      expect(res.body.productos.length).toBeLessThanOrEqual(5);
    });

    test('debe filtrar por categoría', async () => {
      // Primero obtener una categoría válida
      const productos = await Producto.find().limit(1);
      if (productos.length > 0) {
        const categoria = productos[0].category;
        const res = await request(app).get(`/api/productos?categoria=${categoria}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.productos.every(p => p.category === categoria)).toBe(true);
      }
    });
  });

  // ==================== POST /api/productos ====================
  describe('POST /api/productos', () => {
    test('debe crear un nuevo producto con datos válidos', async () => {
      const nuevoProducto = {
        nombre: 'Producto Test Jest',
        descripcion: 'Descripción de prueba',
        precio: 99.99,
        imagen: 'https://via.placeholder.com/300',
        categoria: 'Test'
      };

      const res = await request(app)
        .post('/api/productos')
        .send(nuevoProducto);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('mensaje');
      expect(res.body).toHaveProperty('producto');
      expect(res.body.producto.text1).toBe(nuevoProducto.nombre);
      expect(res.body.producto.priceEuros).toBe(nuevoProducto.precio);

      // Guardar el ID para tests posteriores
      productoId = res.body.producto._id;
      productoCreado = res.body.producto;
    });

    test('debe fallar sin nombre', async () => {
      const productoInvalido = {
        precio: 50.00
      };

      const res = await request(app)
        .post('/api/productos')
        .send(productoInvalido);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('debe fallar sin precio', async () => {
      const productoInvalido = {
        nombre: 'Producto sin precio'
      };

      const res = await request(app)
        .post('/api/productos')
        .send(productoInvalido);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('debe fallar con precio negativo', async () => {
      const productoInvalido = {
        nombre: 'Producto precio negativo',
        precio: -10
      };

      const res = await request(app)
        .post('/api/productos')
        .send(productoInvalido);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('mayor o igual a 0');
    });

    test('debe fallar con precio no numérico', async () => {
      const productoInvalido = {
        nombre: 'Producto precio inválido',
        precio: 'no-es-numero'
      };

      const res = await request(app)
        .post('/api/productos')
        .send(productoInvalido);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ==================== GET /api/productos/:id ====================
  describe('GET /api/productos/:id', () => {
    test('debe obtener un producto por ID válido', async () => {
      // Usar el producto creado en el test anterior
      if (!productoId) {
        // Si no hay producto creado, crear uno
        const producto = await Producto.create({
          text1: 'Producto para GET',
          text2: 'Descripción test',
          priceEuros: 25.50,
          priceText: '€/ud.',  // Solo el sufijo
          imageUrl: 'https://via.placeholder.com/300',
          category: 'Test',
          subcategory: 'Test GET'
        });
        productoId = producto._id.toString();
      }

      const res = await request(app).get(`/api/productos/${productoId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', productoId);
      expect(res.body).toHaveProperty('text1');
      expect(res.body).toHaveProperty('priceEuros');
    });

    test('debe devolver 404 para ID inexistente', async () => {
      const idInexistente = '000000000000000000000000';
      const res = await request(app).get(`/api/productos/${idInexistente}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('no encontrado');
    });

    test('debe devolver 400 para ID inválido', async () => {
      const idInvalido = 'id-invalido-123';
      const res = await request(app).get(`/api/productos/${idInvalido}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('inválido');
    });
  });

  // ==================== PUT /api/productos/:id ====================
  describe('PUT /api/productos/:id', () => {
    test('debe actualizar el precio de un producto', async () => {
      // Asegurarse de que hay un producto para actualizar
      if (!productoId) {
        const producto = await Producto.create({
          text1: 'Producto para PUT',
          text2: 'Descripción test',
          priceEuros: 30.00,
          priceText: '€/ud.',  // Solo el sufijo
          imageUrl: 'https://via.placeholder.com/300',
          category: 'Test',
          subcategory: 'Test PUT'
        });
        productoId = producto._id.toString();
      }

      const nuevoPrecio = { precio: 45.99 };
      const res = await request(app)
        .put(`/api/productos/${productoId}`)
        .send(nuevoPrecio);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('producto');
      expect(res.body.producto.priceEuros).toBe(45.99);
    });

    test('debe fallar con precio inválido', async () => {
      const precioInvalido = { precio: 'abc' };
      const res = await request(app)
        .put(`/api/productos/${productoId}`)
        .send(precioInvalido);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('debe fallar con precio negativo', async () => {
      const precioNegativo = { precio: -5 };
      const res = await request(app)
        .put(`/api/productos/${productoId}`)
        .send(precioNegativo);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('debe devolver 404 para ID inexistente', async () => {
      const idInexistente = '000000000000000000000000';
      const nuevoPrecio = { precio: 20.00 };
      const res = await request(app)
        .put(`/api/productos/${idInexistente}`)
        .send(nuevoPrecio);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    test('debe devolver 400 para ID inválido', async () => {
      const idInvalido = 'id-mal-formato';
      const nuevoPrecio = { precio: 20.00 };
      const res = await request(app)
        .put(`/api/productos/${idInvalido}`)
        .send(nuevoPrecio);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ==================== DELETE /api/productos/:id ====================
  describe('DELETE /api/productos/:id', () => {
    test('debe eliminar un producto existente', async () => {
      // Crear un producto específico para eliminar
      const productoParaEliminar = await Producto.create({
        text1: 'Producto para DELETE',
        text2: 'Descripción test',
        priceEuros: 15.00,
        priceText: '€/ud.',  // Solo el sufijo
        imageUrl: 'https://via.placeholder.com/300',
        category: 'Test',
        subcategory: 'Test DELETE'
      });

      const res = await request(app).delete(`/api/productos/${productoParaEliminar._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('mensaje');
      expect(res.body.producto).toHaveProperty('_id');
      expect(res.body.producto).toHaveProperty('nombre');

      // Verificar que realmente se eliminó
      const productoEliminado = await Producto.findById(productoParaEliminar._id);
      expect(productoEliminado).toBeNull();
    });

    test('debe devolver 404 para ID inexistente', async () => {
      const idInexistente = '000000000000000000000000';
      const res = await request(app).delete(`/api/productos/${idInexistente}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('no encontrado');
    });

    test('debe devolver 400 para ID inválido', async () => {
      const idInvalido = 'formato-invalido';
      const res = await request(app).delete(`/api/productos/${idInvalido}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('inválido');
    });
  });

  // ==================== Tests de integración ====================
  describe('Flujo completo CRUD', () => {
    test('debe completar un ciclo completo de CRUD', async () => {
      // 1. CREATE
      const nuevoProducto = {
        nombre: 'Producto CRUD Completo',
        precio: 100.00,
        descripcion: 'Test de ciclo completo',
        categoria: 'Test CRUD'
      };

      const resCreate = await request(app)
        .post('/api/productos')
        .send(nuevoProducto);

      expect(resCreate.statusCode).toBe(201);
      const productoCreadoId = resCreate.body.producto._id;

      // 2. READ
      const resRead = await request(app).get(`/api/productos/${productoCreadoId}`);
      expect(resRead.statusCode).toBe(200);
      expect(resRead.body.text1).toBe(nuevoProducto.nombre);

      // 3. UPDATE
      const resUpdate = await request(app)
        .put(`/api/productos/${productoCreadoId}`)
        .send({ precio: 150.00 });

      expect(resUpdate.statusCode).toBe(200);
      expect(resUpdate.body.producto.priceEuros).toBe(150.00);

      // 4. DELETE
      const resDelete = await request(app).delete(`/api/productos/${productoCreadoId}`);
      expect(resDelete.statusCode).toBe(200);

      // 5. Verificar que no existe
      const resVerify = await request(app).get(`/api/productos/${productoCreadoId}`);
      expect(resVerify.statusCode).toBe(404);
    });
  });
});
