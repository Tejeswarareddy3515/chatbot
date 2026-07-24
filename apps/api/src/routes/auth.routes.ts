import { Router, Request, Response, NextFunction } from "express";
import passport from "../config/passport";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimit";
import * as AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/register", authLimiter, validate(AuthController.registerValidation), AuthController.register);
router.post("/login", authLimiter, validate(AuthController.loginValidation), AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", requireAuth, AuthController.me);

// Only expose an OAuth route if its passport strategy was actually registered
// (i.e. the provider's client id/secret are set). Otherwise return a clear 501.
function ifStrategyEnabled(name: string, handler: (req: Request, res: Response, next: NextFunction) => void) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(passport as any)._strategy(name)) {
      return res.status(501).json({ error: `${name} login is not configured on this server.` });
    }
    handler(req, res, next);
  };
}

router.get("/google", ifStrategyEnabled("google", passport.authenticate("google", { scope: ["profile", "email"], session: false })));
router.get(
  "/google/callback",
  ifStrategyEnabled("google", passport.authenticate("google", { session: false, failureRedirect: "/login" })),
  AuthController.oauthCallback
);

router.get("/github", ifStrategyEnabled("github", passport.authenticate("github", { scope: ["user:email"], session: false })));
router.get(
  "/github/callback",
  ifStrategyEnabled("github", passport.authenticate("github", { session: false, failureRedirect: "/login" })),
  AuthController.oauthCallback
);

export default router;
