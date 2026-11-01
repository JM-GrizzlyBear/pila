export type Role = "admin" | "staff";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  // false: turned off by an admin, can't sign in
  active: boolean;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// Everything except the password hash: safe to send to the browser
export type SafeUser = Omit<User, "passwordHash" | "updatedAt">;

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
  };
}
