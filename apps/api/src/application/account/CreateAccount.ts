import { toSafeUser, type Role } from "../../domain/user/User.js";
import type { UserRepository } from "../../domain/user/UserRepository.js";
import {
  EmailTakenError,
  UsernameTakenError,
} from "../../domain/user/errors.js";
import { normalizeLogin } from "../../domain/user/rules.js";
import type { PasswordHasher } from "../ports/PasswordHasher.js";

export interface CreateAccountInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: Role;
  // The first password the admin gives the person
  password: string;
}

// Admin → Accounts → Add account. There's no public sign-up: every account is made here.
export class CreateAccount {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  async execute(input: CreateAccountInput) {
    const username = normalizeLogin(input.username);
    const email = normalizeLogin(input.email);

    if (await this.users.findByUsername(username))
      throw new UsernameTakenError();
    if (await this.users.findByEmail(email)) throw new EmailTakenError();

    const user = await this.users.create({
      username,
      email,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      role: input.role,
      passwordHash: await this.passwords.hash(input.password),
    });
    return toSafeUser(user);
  }
}
