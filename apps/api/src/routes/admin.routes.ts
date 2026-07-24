import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import * as AdminController from "../controllers/admin.controller";

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/overview", AdminController.getOverview);
router.get("/users", AdminController.listUsers);
router.patch("/users/:id/role", AdminController.updateUserRole);
router.get("/logs", AdminController.listLogs);

export default router;
