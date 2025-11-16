// seed.js
import Producto from "./model/Producto.js";
import Usuario from "./model/Usuario.js";
import connectDB from "./model/db.js";
import mongoose from "mongoose";
import fs from "node:fs";

/**
 * Carga los productos desde el archivo JSON a la base de datos MongoDB.
 * Elimina los productos existentes antes de insertar los nuevos.
 * También crea un usuario administrador con credenciales 'admin'/'admin'.
 */
async function seed() {
  try {
    // Conectar a MongoDB
    await connectDB();
    console.log("✓ Conectado a la base de datos");

    // Leer el archivo productos.json
    const productosPath = "./products.json";
    const jsonData = fs.readFileSync(productosPath, "utf8");
    const productos = JSON.parse(jsonData);

    console.log(`Encontrados ${productos.length} productos para insertar`);

    // Limpiar los productos existentes
    await Producto.deleteMany({});
    console.log("✓ Productos existentes eliminados");

    // Insertar todos los productos en MongoDB
    await Producto.insertMany(productos);
    console.log(`✓ ${productos.length} productos insertados correctamente en MongoDB`);

    // Seleccionar 20 productos aleatorios para marcar como rebajados
    const totalProductos = await Producto.countDocuments({});
    const numeroRebajados = Math.min(20, totalProductos); // Por si hay menos de 20 productos

    // Obtener todos los IDs y seleccionar 20 aleatorios
    const todosLosProductos = await Producto.find({}, '_id priceEuros');
    const indicesAleatorios = new Set();

    while (indicesAleatorios.size < numeroRebajados) {
      const indiceAleatorio = Math.floor(Math.random() * todosLosProductos.length);
      indicesAleatorios.add(indiceAleatorio);
    }

    // Actualizar los productos seleccionados con precio rebajado (10% de descuento)
    let productosActualizados = 0;
    for (const indice of indicesAleatorios) {
      const producto = todosLosProductos[indice];
      const precioRebajado = Math.round(producto.priceEuros * 0.9 * 100) / 100; // 10% descuento, redondeado a 2 decimales
      await Producto.findByIdAndUpdate(producto._id, { precioRebajado });
      productosActualizados++;
    }

    console.log(`✓ ${productosActualizados} productos marcados como rebajados (10% de descuento)`);

    // Crear usuario administrador solo si no existe
    const adminExistente = await Usuario.findOne({ username: 'admin' });

    if (!adminExistente) {
      const adminUser = new Usuario({
        username: 'admin',
        email: 'admin@tienda.com',
        password: 'admin123', // Se cifrará automáticamente por el hook pre-save
        admin: true
      });

      await adminUser.save();
      console.log("✓ Usuario administrador creado (username: 'admin', password: 'admin123')");
    } else {
      console.log("✓ Usuario administrador ya existe, no se creó uno nuevo");
    }

    // Cerrar la conexión con la base de datos
    await mongoose.connection.close();
    console.log("✓ Conexión a la base de datos cerrada");

    process.exit(0);
  } catch (error) {
    console.error("Error durante el seed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
