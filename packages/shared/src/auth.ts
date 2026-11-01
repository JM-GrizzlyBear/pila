import { z } from "zod";

export const AUTH_LIMITS = {
  usernameMin: 3,
  usernameMax: 25,
  nameMax: 50,
  passwordMin: 8,
  passwordMax: 72, // bcrypt only uses the first 72 bytes
} as const;

// Admins set up the place and manage accounts; staff work the counters
export const ROLES = ["admin", "staff"] as const;
export type Role = (typeof ROLES)[number];

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(
    AUTH_LIMITS.usernameMin,
    `At least ${AUTH_LIMITS.usernameMin} characters`,
  )
  .max(AUTH_LIMITS.usernameMax, `At most ${AUTH_LIMITS.usernameMax} characters`)
  .regex(/^[a-z0-9_]+$/, "Only letters, numbers and _");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email");

export const passwordSchema = z
  .string()
  .min(
    AUTH_LIMITS.passwordMin,
    `At least ${AUTH_LIMITS.passwordMin} characters`,
  )
  .max(
    AUTH_LIMITS.passwordMax,
    `At most ${AUTH_LIMITS.passwordMax} characters`,
  );

const nameSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(AUTH_LIMITS.nameMax, `At most ${AUTH_LIMITS.nameMax} characters`);

export const loginSchema = z.object({
  // A username or an email address
  login: z.string().trim().toLowerCase().min(1, "Required"),
  password: z.string().min(1, "Required").max(AUTH_LIMITS.passwordMax),
});

// Admin → Accounts → Add account. The password is a first password the admin
// gives the person; they can change it later.
export const createAccountSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  role: z.enum(ROLES, "Choose a role"),
  password: passwordSchema,
});

// Admin → Accounts → Edit. The username never changes.
export const updateAccountSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  role: z.enum(ROLES, "Choose a role"),
  // false: the account can't sign in, and is signed out everywhere
  active: z.boolean(),
});

// Admin → Accounts → Edit → Set a new password
export const setPasswordSchema = z.object({
  password: passwordSchema,
});

export type LoginInput = z.input<typeof loginSchema>;
export type CreateAccountInput = z.input<typeof createAccountSchema>;
export type UpdateAccountInput = z.input<typeof updateAccountSchema>;
export type SetPasswordInput = z.input<typeof setPasswordSchema>;

// What the API sends back about an account (never the password hash)
export interface PublicUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  // false: turned off by an admin, can't sign in
  active: boolean;
  createdAt: string;
}
