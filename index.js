import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { loadBackendAGB } from "./src/back/public-transit.js";

import { handler } from './front/build/handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 16078;

const BASE_API = "/api/v1";

app.use(express.json());
app.use(cors());
//app.use("/", express.static(__dirname));

app.get("/", (req, res) => {
    res.redirect("/about");
  });
  

loadBackendAGB(app);


app.use(handler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

