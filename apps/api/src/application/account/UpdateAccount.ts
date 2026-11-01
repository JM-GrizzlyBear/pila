import { toSafeUser } from "../../domain/user/User.js";
import type {
  UserChanges,
  UserRepository,
} from "../../domain/user/UserRepository.js";
import {
  AccountNotFoundError,
  EmailTakenError,
} from "../../domain/user/errors.js";
import { checkAccessChange, normalizeLogin } from "../../domain/user/rules.js";
import type { SessionStore } from "../ports/SessionStore.js";

// Admin → Accounts → Edit: name, email, role, and turning the account on or off
export class UpdateAccount {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionStore,
  ) {}

  async execute(actorId: string, targetId: string, input: UserChanges) {
    const target = await this.users.findById(targetId);
    if (!target) throw new AccountNotFoundError();
    const wasActive = target.active;

    const changes = {
      ...input,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: normalizeLogin(input.email),
    };

    checkAccessChange({
      actorId,
      targetId,
      before: target,
      after: changes,
      activeAdmins: await this.users.countActiveAdmins(),
    });

    if (changes.email !== target.email) {
      const owner = await this.users.findByEmail(changes.email);
      if (owner && owner.id !== targetId) throw new EmailTakenError();
    }

    const updated = await this.users.update(targetId, changes);
    if (!updated) throw new AccountNotFoundError();

    // Turned off: signed out on every device right away
    if (wasActive && !updated.active) {
      await this.sessions.endAllFor(targetId);
    }
    return toSafeUser(updated);
  }
}
