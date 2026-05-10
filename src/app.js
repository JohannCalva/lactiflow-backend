import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

// Carga las variables del .env y las pone en process.env
dotenv.config();

// Crear una instancia aplicacion de express
const app = express();
// Para permitir que los dominios se puedan comunicar con el servidor
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, //Para que express agregue el header Access-Controll...
  }),
);
// Metodo para que express entienda el JSON en el body de las requests (req.body)
app.use(express.json());
// Metodo para ver las llamadas al back
app.use(morgan("dev"));

const PORT = process.env.PORT || 3000;

// Arranca el servidor en el puerto definido
// El callback se ejecuta cuando el servidor esta listo para recibir requests
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

export default app;
