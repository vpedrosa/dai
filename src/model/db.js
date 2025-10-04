// ./model/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.MONGODB_URL;

/**
 * Conecta a la base de datos MongoDB usando Mongoose.
 * Lee la URL de conexión desde las variables de entorno.
 * Configura listeners para los eventos de conexión.
 */
export default async function connectDB() {
  try {
    await mongoose.connect(url);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const dbConnection = mongoose.connection;

  // Evento que se dispara cuando la conexión se abre correctamente
  dbConnection.once("open", (_) => {
    console.log(`Database connected: ${url}`);
  });

  // Evento que se dispara cuando hay un error en la conexión
  dbConnection.on("error", (err) => {
    console.error(`connection error: ${err}`);
  });
  return;
}
