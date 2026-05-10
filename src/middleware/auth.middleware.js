import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const verifyToken = (req, res, next) => {
  // Extraemos el header que trae el token
  const authHeader = req.headers.authorization;

  // Verificamos que exista y tenga el formato correcto: 'Bearer <token>'
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acceso denegado, token no proporcionado" });
  }

  // Cortamos el string separando por el espacio para quedarnos solo con el token en si
  const token = authHeader.split(" ")[1];

  try {
    // Si el token es valido y no ha caducado, decodificamos lo que metimos (id, email, role)
    const decoded = jwt.verify(token, JWT_SECRET);
    // Guardamos los datos del usuario en la request actual para poder revisarlos en los siguientes middlewares
    req.user = decoded;
    next(); // Da luz verde para continuar con la request
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
