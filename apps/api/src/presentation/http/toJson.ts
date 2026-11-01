import type { PublicUser } from "@pila/shared";
import type { SafeUser } from "../../domain/user/User.js";

// Domain objects → what the browser receives (dates as ISO strings, no internal fields)

export function userJson(user: SafeUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt.toISOString(),
  };
}
