import Product from "./src/model/Product.js";
import connectDB from "./src/model/db.js";
import mongoose from "mongoose";

/**
 * Ejecuta varias consultas de ejemplo sobre la base de datos de productos:
 * - Productos de menos de 1€
 * - Productos de menos de 1€ que no sean agua
 * - Aceites ordenados por precio
 * - Productos en garrafa
 */
async function runQueries() {
  try {
    // Conectar a MongoDB
    await connectDB();
    console.log("Connected to database\n");

    // Consulta 1: Productos de menos de 1 €
    console.log("=== Productos de menos de 1 € ===");
    const productsUnder1Euro = await Product.find({ priceEuros: { $lt: 1 } });
    console.log(`Total: ${productsUnder1Euro.length} productos`);
    productsUnder1Euro.forEach(p => {
      console.log(`- ${p.text1} (${p.priceEuros}€)`);
    });

    // Consulta 2: Productos de menos de 1 € que no sean agua
    console.log("\n=== Productos de menos de 1 € que no sean agua ===");
    const productsUnder1EuroNoWater = await Product.find({
      priceEuros: { $lt: 1 },
      text1: { $not: /agua/i }
    });
    console.log(`Total: ${productsUnder1EuroNoWater.length} productos`);
    productsUnder1EuroNoWater.forEach(p => {
      console.log(`- ${p.text1} (${p.priceEuros}€)`);
    });

    // Consulta 3: Aceites ordenados por precio
    console.log("\n=== Aceites ordenados por precio ===");
    const oils = await Product.find({
      $or: [
        { subcategory: /aceite/i },
        { text1: /aceite/i }
      ]
    }).sort({ priceEuros: 1 });
    console.log(`Total: ${oils.length} productos`);
    oils.forEach(p => {
      console.log(`- ${p.text1} - ${p.text2} (${p.priceEuros}€)`);
    });

    // Consulta 4: Productos en garrafa
    console.log("\n=== Productos en garrafa ===");
    const productsInGarrafa = await Product.find({
      text2: /garrafa/i
    });
    console.log(`Total: ${productsInGarrafa.length} productos`);
    productsInGarrafa.forEach(p => {
      console.log(`- ${p.text1} - ${p.text2} (${p.priceEuros}€)`);
    });

    // Cerrar la conexión con la base de datos
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error during queries:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

runQueries();
