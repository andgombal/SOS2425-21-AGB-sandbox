import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { loadBackendAGB } from "./src/back/public-transit.js";
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Especificamos la ruta absoluta con un nombre claro
const handlerPath = process.env.NODE_ENV === 'production' 
  ? '/opt/render/project/src/src/front/build/handler.js' // Path en Render
  : join(__dirname, 'src', 'front', 'build', 'handler.js');  // Path local

// Verificar si el archivo existe
async function startServer() {
  try {
    // Verificar si el archivo handler.js existe
    await fs.access(handlerPath);

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
    console.error(`Error loading handler from: ${handlerPath}`, error);
    process.exit(1);  // Detener si el archivo no se encuentra
  }
}

startServer();
