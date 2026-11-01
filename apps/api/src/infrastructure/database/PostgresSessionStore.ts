import type { Pool } from "pg";
import type { SessionStore } from "../../application/ports/SessionStore.js";

// Sessions live in the "session" table (connect-pg-simple); sess holds { userId, cookie }.
// Deleting the rows signs that person out on every device.
export class PostgresSessionStore implements SessionStore {
  constructor(private readonly pool: Pool) {}

  async endAllFor(userId: string) {
    await this.pool.query("delete from session where sess->>'userId' = $1", [
      userId,
    ]);
  }
}
