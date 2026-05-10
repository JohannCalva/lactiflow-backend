// Middleware para proteger rutas exclusivas de los administradores
export const requireAdmin = (req, res, next) => {
  // Comprobamos el rol que sacamos del JWT previamente en verifyToken
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado, se requiere rol de administrador" });
  }
  // Si todo esta bien, sigue a la funcion del controlador
  next();
};

// Middleware para rutas compartidas
export const requireEmprendedorOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "emprendedor" && req.user.role !== "admin")) {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  next();
};
