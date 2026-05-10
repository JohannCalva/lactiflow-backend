import { Router } from "express";
import businessTypeRoutes from "./businessType.routes.js";
import clientRoutes from "./client.routes.js";
import productRoutes from "./product.routes.js";
import userRoutes from "./user.routes.js";
import deliveryRoutes from "./delivery.routes.js";
import authRoutes from "./auth.routes.js";

import { verifyToken } from "../middleware/auth.middleware.js";
import { requireAdmin, requireEmprendedorOrAdmin } from "../middleware/role.middleware.js";

const router = Router();

// Rutas publicas de login y registro, no necesitan token
router.use("/auth", authRoutes);

// De aqui en adelante, el middleware verifica que las rutas exijan enviar un token valido
router.use(verifyToken);

// Rutas que unicamente puede utilizar un usuario con rol 'admin'
router.use("/business_type", requireAdmin, businessTypeRoutes);
router.use("/client", requireAdmin, clientRoutes);
router.use("/product", requireAdmin, productRoutes);
router.use("/user", requireAdmin, userRoutes);

// Aca dejamos pasar tanto a los admins como a los emprendedores para gestionar envios
router.use("/delivery", requireEmprendedorOrAdmin, deliveryRoutes);

export default router;
