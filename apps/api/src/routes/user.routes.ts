import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as UserController from "../controllers/user.controller";

const router = Router();

router.use(requireAuth);
router.patch("/profile", validate(UserController.updateProfileValidation), UserController.updateProfile);
router.get("/settings", UserController.getSettings);
router.patch("/settings", validate(UserController.updateSettingsValidation), UserController.updateSettings);
router.get("/subscription", UserController.getSubscription);

export default router;
