import express from "express";
import cors from "cors";

import { loadBackendAGB } from "./src/back/public-transit.js";

import { handler } from "./src/front/build/handler.js";

const app = express();
const PORT = process.env.PORT || 16078;
const BASE_API= "/api/v1";

app.use(express.json());
app.use(cors());

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}...`);
});

loadBackendAGB(app);

app.use(handler);