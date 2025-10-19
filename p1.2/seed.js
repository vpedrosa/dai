import ProductParser from "./src/services/productParser.js";
import Product from "./src/model/Product.js";
import connectDB from "./src/model/db.js";
import mongoose from "mongoose";
import fs from "node:fs";

/**
 * Procesa todos los archivos HTML de productos, genera los archivos JSON
 * correspondientes, y carga todos los productos en la base de datos MongoDB.
 * Elimina los productos existentes antes de insertar los nuevos.
 */
async function seed() {
  try {
    // Conectar a MongoDB
    await connectDB();
    console.log("Connected to database");

    // Procesar todos los archivos HTML
    const parser = new ProductParser();
    console.log("Parsing HTML files...");
    parser.parseAll();

    // Leer el archivo all.json generado
    const allJsonPath = "parsedJson/all.json";
    const jsonData = fs.readFileSync(allJsonPath, "utf8");
    const products = JSON.parse(jsonData);

    console.log(`Found ${products.length} products to insert`);

    // Limpiar los productos existentes
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insertar todos los productos en MongoDB
    await Product.insertMany(products);
    console.log(`Successfully inserted ${products.length} products into MongoDB`);

    // Cerrar la conexión con la base de datos
    await mongoose.connection.close();
    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error during seed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
