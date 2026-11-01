import type { PublicUser, Role } from "@pila/shared";

// "Maria Santos"; the username when there's no name yet
export function displayName(
  user: Pick<PublicUser, "firstName" | "lastName" | "username">,
) {
  return `${user.firstName} ${user.lastName}`.trim() || user.username;
}

// "MS", for the round badge
export function initials(
  user: Pick<PublicUser, "firstName" | "lastName" | "username">,
) {
  const letters = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  return (letters || user.username.slice(0, 2)).toUpperCase();
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
};

// For the role dropdown, staff first (the usual choice)
export const ROLE_OPTIONS = (["staff", "admin"] as const).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));
