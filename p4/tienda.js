// tienda.js - Servidor principal
import logger from "./config/logger.js"
import connectDB from "./model/db.js"
import app from "./app.js"

// Conectar a la base de datos
await connectDB()

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logger.info(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
})
