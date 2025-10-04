import { exec } from "node:child_process";
import { promisify } from "node:util";
import dotenv from "dotenv";

dotenv.config();

const execAsync = promisify(exec);

/**
 * Realiza una copia de seguridad de la base de datos MongoDB usando mongodump
 * dentro del contenedor Docker. La copia se guarda como archivo .archive
 * con timestamp y se copia a la raíz del proyecto.
 */
async function backup() {
  try {
    const mongoUrl = process.env.MONGODB_URL;

    if (!mongoUrl) {
      throw new Error("MONGODB_URL not found in .env file");
    }

    // Extraer el nombre de la base de datos de la URL
    // Formato URL: mongodb://user:pass@host:port/dbname?params
    const dbMatch = mongoUrl.match(/\/([^?\/]+)(\?|$)/);
    const dbName = dbMatch ? dbMatch[1] : "DAI";

    const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
    const backupName = `${dbName}_${timestamp}`;

    console.log(`Starting backup of database: ${dbName}`);
    console.log(`Backup name: ${backupName}`);

    // Usar docker exec para ejecutar mongodump dentro del contenedor
    const containerName = "dai-mongo-1"; // nombre por defecto del contenedor de docker compose
    const command = `docker exec ${containerName} mongodump --username=root --password=example --authenticationDatabase=admin --db=${dbName} --archive=/data/db/backups/${backupName}.archive`;

    // Crear directorio de backups dentro del contenedor
    await execAsync(`docker exec ${containerName} mkdir -p /data/db/backups`);

    const { stdout, stderr } = await execAsync(command);

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log(`Backup completed successfully`);

    // Copiar el backup a la raíz del proyecto
    const sourceBackup = `./data/backups/${backupName}.archive`;
    const destBackup = `./${backupName}.archive`;

    await execAsync(`cp ${sourceBackup} ${destBackup}`);
    console.log(`Backup copied to: ${destBackup}`);

    process.exit(0);
  } catch (error) {
    console.error("Error during backup:", error.message);
    process.exit(1);
  }
}

backup();
