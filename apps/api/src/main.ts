import { EnsureFirstAdmin } from "./application/account/EnsureFirstAdmin.js";
import { buildApp } from "./buildApp.js";
import { readEnv } from "./config/env.js";
import { PostgresUserRepository } from "./infrastructure/database/PostgresUserRepository.js";
import { createPool } from "./infrastructure/database/pool.js";
import { BcryptPasswordHasher } from "./infrastructure/security/BcryptPasswordHasher.js";
import { SystemClock } from "./infrastructure/time/SystemClock.js";

const env = readEnv();
const pool = createPool(env.databaseUrl);
const passwordHasher = new BcryptPasswordHasher();

// The first admin, from the ADMIN_* settings (only while there's no admin yet)
const users = new PostgresUserRepository(pool);
if (env.firstAdmin) {
  const result = await new EnsureFirstAdmin(users, passwordHasher).execute(
    env.firstAdmin,
  );
  console.log(
    result === "created"
      ? `First admin created: ${env.firstAdmin.username}`
      : "First admin: an admin already exists, the ADMIN_* settings are ignored",
  );
} else if ((await users.countAdmins()) === 0) {
  console.warn(
    "No admin yet: set ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD and restart.",
  );
}

const app = buildApp({
  pool,
  sessionSecret: env.sessionSecret,
  passwordHasher,
  clock: new SystemClock(),
  secureCookie: env.secureCookie,
  trustProxy: env.isProduction,
  webDistDir: env.webDistDir,
});

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});

async function shutDown() {
  server.close();
  await pool.end();
  process.exit(0);
}

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
