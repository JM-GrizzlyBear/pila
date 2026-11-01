import { loginSchema } from "@pila/shared";
import { Router, type RequestHandler } from "express";
import type { GetCurrentUser } from "../../../application/user/GetCurrentUser.js";
import type { LogInUser } from "../../../application/user/LogInUser.js";
import { currentUserId, requireAuth } from "../middleware/requireAuth.js";
import { SESSION_COOKIE, endSession, startSession } from "../session.js";
import { userJson } from "../toJson.js";

// There's no sign-up: admins create every account (Admin → Accounts)
export function authRoutes(deps: {
  logInUser: LogInUser;
  getCurrentUser: GetCurrentUser;
  // Slows down password guessing
  limit: RequestHandler;
}) {
  const router = Router();

  router.post("/auth/login", deps.limit, async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await deps.logInUser.execute(input);
    await startSession(req, user.id);
    res.json({ user: userJson(user) });
  });

  router.get("/auth/me", requireAuth, async (req, res) => {
    const user = await deps.getCurrentUser.execute(currentUserId(req));
    res.json({ user: userJson(user) });
  });

  router.post("/auth/logout", async (req, res) => {
    await endSession(req);
    res.clearCookie(SESSION_COOKIE);
    res.status(204).end();
  });

  return router;
}
