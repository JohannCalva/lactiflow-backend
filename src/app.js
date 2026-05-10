import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes/index.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

// Carga las variables de entorno desde el archivo .env a process.env
dotenv.config();

// Instancia principal de la app
const app = express();

// Configuracion de CORS para permitir peticiones desde el frontend local (Vite por defecto usa 5173)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Permite enviar cookies o headers de autorizacion
  }),
);

// Middleware para que Express entienda el formato JSON que viene en el body
app.use(express.json());

// Morgan sirve para ver las peticiones http en la consola mientras desarrollamos
app.use(morgan("dev"));

// Aca montamos todas las rutas de nuestra API, asi todas empiezan con /api
app.use("/api", routes);

// Este manejador atrapa cualquier error que ocurra en las rutas para no tumbar el servidor
// y siempre devolver un json con el formato { "error": "mensaje" }
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Arranca el servidor
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

export default app;
