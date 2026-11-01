import type { UserRepository } from "../../domain/user/UserRepository.js";
import { normalizeLogin } from "../../domain/user/rules.js";
import type { PasswordHasher } from "../ports/PasswordHasher.js";

export interface FirstAdmin {
  username: string;
  email: string;
  password: string;
}

// Runs when the API starts: creates the first admin from the ADMIN_* settings,
// but only while there's no admin yet. After that the settings are never used
// again, so changing them later can't overwrite anyone's account.
export class EnsureFirstAdmin {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  async execute(admin: FirstAdmin): Promise<"created" | "already there"> {
    if ((await this.users.countAdmins()) > 0) return "already there";

    await this.users.create({
      username: normalizeLogin(admin.username),
      email: normalizeLogin(admin.email),
      firstName: "Admin",
      lastName: "",
      role: "admin",
      passwordHash: await this.passwords.hash(admin.password),
    });
    return "created";
  }
}
