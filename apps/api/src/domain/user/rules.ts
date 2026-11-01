import type { Role } from "./User.js";
import { LastAdminError, OwnAccessError } from "./errors.js";

// "maria" logs in with a username, "maria@example.com" with an email
export function isEmail(login: string) {
  return login.includes("@");
}

// Usernames and emails are compared without capitals or surrounding spaces
export function normalizeLogin(value: string) {
  return value.trim().toLowerCase();
}

interface Access {
  role: Role;
  active: boolean;
}

// The rules for changing who can do what:
// - an admin can't change their own role or turn off their own account (no locking yourself out)
// - there must always be at least one admin who can sign in
export function checkAccessChange(change: {
  actorId: string;
  targetId: string;
  before: Access;
  after: Access;
  activeAdmins: number;
}) {
  const { before, after } = change;
  const accessChanges =
    before.role !== after.role || before.active !== after.active;
  if (!accessChanges) return;

  if (change.actorId === change.targetId) throw new OwnAccessError();

  const wasActiveAdmin = before.role === "admin" && before.active;
  const staysActiveAdmin = after.role === "admin" && after.active;
  if (wasActiveAdmin && !staysActiveAdmin && change.activeAdmins <= 1) {
    throw new LastAdminError();
  }
}
