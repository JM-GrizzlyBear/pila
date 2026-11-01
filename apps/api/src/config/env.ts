import "dotenv/config";
import { emailSchema, passwordSchema, usernameSchema } from "@pila/shared";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is missing. See apps/api/.env.example.`);
  return value;
}

// The first admin: either all three ADMIN_* settings, or none.
// Only used while there's no admin yet (see EnsureFirstAdmin).
function readFirstAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username && !email && !password) return undefined;
  if (!username || !email || !password) {
    throw new Error(
      "Set all three of ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD, or none of them.",
    );
  }
  const checks = [
    ["ADMIN_USERNAME", usernameSchema.safeParse(username)],
    ["ADMIN_EMAIL", emailSchema.safeParse(email)],
    ["ADMIN_PASSWORD", passwordSchema.safeParse(password)],
  ] as const;
  for (const [name, result] of checks) {
    if (!result.success) {
      throw new Error(`${name}: ${result.error.issues[0].message}`);
    }
  }
  return { username, email, password };
}

// Reads and checks every setting once, at startup, so a mistake fails loudly right away
export function readEnv() {
  const sessionSecret = required("SESSION_SECRET");
  if (sessionSecret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be at least 32 characters (openssl rand -hex 32)",
    );
  }
  const isProduction = process.env.NODE_ENV === "production";

  return {
    port: Number(process.env.PORT ?? 4000),
    databaseUrl: required("DATABASE_URL"),
    sessionSecret,
    isProduction,
    // HTTPS-only cookies. On by default in production; set COOKIE_SECURE=false to test
    // the production Docker image on http://localhost.
    secureCookie:
      (process.env.COOKIE_SECURE ?? String(isProduction)) === "true",
    // Only set in production (the Docker image sets it)
    webDistDir: process.env.WEB_DIST_DIR?.trim() || undefined,
    firstAdmin: readFirstAdmin(),
  };
}
