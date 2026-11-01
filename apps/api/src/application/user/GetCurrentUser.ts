import { toSafeUser } from "../../domain/user/User.js";
import type { UserRepository } from "../../domain/user/UserRepository.js";
import { NotLoggedInError } from "../../domain/user/errors.js";

export class GetCurrentUser {
  constructor(private readonly users: UserRepository) {}

  // The session can outlive the account (deleted, or turned off by an admin)
  async execute(userId: string) {
    const user = await this.users.findById(userId);
    if (!user?.active) throw new NotLoggedInError();
    return toSafeUser(user);
  }
}
