import { Router } from "express";
import * as clientController from "../controllers/client.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  requireAdmin,
  requireEmprendedorOrAdmin,
} from "../middleware/role.middleware.js";

const router = Router();

// Rutas específicas primero
router.get(
  "/:id/profile",
  verifyToken,
  requireEmprendedorOrAdmin,
  clientController.getClientProfileHandler,
);
router.get(
  "/:id/deliveries",
  verifyToken,
  requireEmprendedorOrAdmin,
  clientController.getClientDeliveriesHandler,
);

// Las rutas genéricas de /:id van después
router.get(
  "/",
  verifyToken,
  requireEmprendedorOrAdmin,
  clientController.getAll,
);
router.get(
  "/:id",
  verifyToken,
  requireEmprendedorOrAdmin,
  clientController.getById,
);
router.post("/", verifyToken, requireAdmin, clientController.create);
router.put("/:id", verifyToken, requireAdmin, clientController.update);
router.delete("/:id", verifyToken, requireAdmin, clientController.remove);

export default router;
