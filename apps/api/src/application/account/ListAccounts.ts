import { toSafeUser } from "../../domain/user/User.js";
import type { UserRepository } from "../../domain/user/UserRepository.js";

export class ListAccounts {
  constructor(private readonly users: UserRepository) {}

  async execute() {
    return (await this.users.list()).map(toSafeUser);
  }
}
