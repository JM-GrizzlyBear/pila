import type { UserRepository } from "../../domain/user/UserRepository.js";
import {
  AccountNotFoundError,
  OwnAccessError,
} from "../../domain/user/errors.js";
import type { PasswordHasher } from "../ports/PasswordHasher.js";
import type { SessionStore } from "../ports/SessionStore.js";

// Admin → Accounts → Edit → Set a new password, for someone who forgot theirs.
// They're signed out everywhere, so only the new password works from now on.
export class SetAccountPassword {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly sessions: SessionStore,
  ) {}

  async execute(actorId: string, targetId: string, password: string) {
    // Your own password is changed on your profile, where you type the current one first
    if (actorId === targetId) throw new OwnAccessError();

    const target = await this.users.findById(targetId);
    if (!target) throw new AccountNotFoundError();

    await this.users.setPasswordHash(
      targetId,
      await this.passwords.hash(password),
    );
    await this.sessions.endAllFor(targetId);
  }
}
