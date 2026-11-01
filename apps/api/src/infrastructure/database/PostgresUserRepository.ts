import type { Pool } from "pg";
import type { Role, User } from "../../domain/user/User.js";
import type {
  NewUser,
  UserChanges,
  UserRepository,
} from "../../domain/user/UserRepository.js";

interface UserRow {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  active: boolean;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

const COLUMNS =
  "id, username, email, first_name, last_name, role, active, password_hash, created_at, updated_at";

function toUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    active: row.active,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  private async findOne(where: string, value: string) {
    const result = await this.pool.query<UserRow>(
      `select ${COLUMNS} from users where ${where} = $1`,
      [value],
    );
    return result.rows[0] ? toUser(result.rows[0]) : null;
  }

  async findById(id: string) {
    return await this.findOne("id", id);
  }

  async findByUsername(username: string) {
    return await this.findOne("username", username);
  }

  async findByEmail(email: string) {
    return await this.findOne("email", email);
  }

  async list() {
    const result = await this.pool.query<UserRow>(
      `select ${COLUMNS} from users
       order by role = 'admin' desc, first_name, last_name, username`,
    );
    return result.rows.map(toUser);
  }

  async countAdmins() {
    const result = await this.pool.query<{ count: number }>(
      "select count(*)::int as count from users where role = 'admin'",
    );
    return result.rows[0].count;
  }

  async countActiveAdmins() {
    const result = await this.pool.query<{ count: number }>(
      "select count(*)::int as count from users where role = 'admin' and active",
    );
    return result.rows[0].count;
  }

  async create(user: NewUser) {
    const result = await this.pool.query<UserRow>(
      `insert into users (username, email, first_name, last_name, role, password_hash)
       values ($1, $2, $3, $4, $5, $6)
       returning ${COLUMNS}`,
      [
        user.username,
        user.email,
        user.firstName,
        user.lastName,
        user.role,
        user.passwordHash,
      ],
    );
    return toUser(result.rows[0]);
  }

  async update(id: string, changes: UserChanges) {
    const result = await this.pool.query<UserRow>(
      `update users
       set first_name = $2, last_name = $3, email = $4, role = $5, active = $6, updated_at = now()
       where id = $1
       returning ${COLUMNS}`,
      [
        id,
        changes.firstName,
        changes.lastName,
        changes.email,
        changes.role,
        changes.active,
      ],
    );
    return result.rows[0] ? toUser(result.rows[0]) : null;
  }

  async setPasswordHash(id: string, passwordHash: string) {
    await this.pool.query(
      "update users set password_hash = $2, updated_at = now() where id = $1",
      [id, passwordHash],
    );
  }
}
