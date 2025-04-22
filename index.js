import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";
import { loadBackendAGB } from "./src/back/public-transit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Usar una ruta absoluta para asegurar que funcione correctamente
const handlerPath = join(__dirname, 'src', 'front', 'build', 'handler.js');

// Verifica si el archivo existe en el path esperado
import { promises as fs } from 'fs';

async function startServer() {
  try {
    await fs.access(handlerPath); // Verifica si el archivo existe
    const { handler } = await import(`file://${handlerPath}`);
    const app = express();
    const PORT = process.env.PORT || 16078;

    const BASE_API = "/api/v1";

    app.use(express.json());
    app.use(cors());

    app.get("/", (req, res) => {
      res.redirect("/about");
    });

    loadBackendAGB(app);

    app.use(handler);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Handler file not found or error loading handler:", error);
    process.exit(1); // Detener si no se encuentra el archivo handler.js
  }
}

startServer();
