import type { RequestHandler } from "express";
import type { GetCurrentUser } from "../../../application/user/GetCurrentUser.js";
import { NotAllowedError } from "../../../domain/user/errors.js";
import { currentUserId } from "./requireAuth.js";

// Lets the request through only for a signed-in admin. The role is read from the
// database on every request, so a change by another admin counts right away.
export function requireAdmin(getCurrentUser: GetCurrentUser): RequestHandler {
  return async (req, _res, next) => {
    const user = await getCurrentUser.execute(currentUserId(req));
    if (user.role !== "admin") throw new NotAllowedError();
    next();
  };
}
