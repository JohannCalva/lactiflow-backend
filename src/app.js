import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes/index.routes.js";
import publicSuggestionsRoutes from "./routes/publicSuggestions.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

// Carga las variables de entorno desde el archivo .env a process.env
dotenv.config();

// Instancia principal de la app
const app = express();

// Middleware para que Express entienda el formato JSON que viene en el body
app.use(express.json());

// Morgan sirve para ver las peticiones http en la consola mientras desarrollamos
app.use(morgan("dev"));

// Rutas publicas — no requieren autenticacion, expuestas intencionalmente bajo /api/public
// Nota: CORS abierto se configura dentro de publicSuggestionsRoutes
app.use("/api/public", publicSuggestionsRoutes);

// Rutas autenticadas — requieren JWT y CORS restringido
app.use(
  "/api",
  cors({
    origin: (origin, callback) => {
      // Permitir cualquier localhost en desarrollo (5173, 5174, etc.)
      if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // Produccion
      callback(null, "https://lactiflow-frontend.vercel.app");
    },
    credentials: true,
  }),
  routes,
);

// Este manejador atrapa cualquier error que ocurra en las rutas para no tumbar el servidor
// y siempre devolver un json con el formato { "error": "mensaje" }
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Arranca el servidor
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

export default app;
