// ./config/logger.js
import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    // Si hay un error con stack trace
    return `${timestamp} [${level}]: ${message}\n${stack}`;
  }
  return `${timestamp} [${level}]: ${message}`;
});

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // Captura stack traces
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Logs de error en archivo separado
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Todos los logs en combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Si no estamos en producción, también loguear a la consola con colores
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    })
  );
}

export default logger;
