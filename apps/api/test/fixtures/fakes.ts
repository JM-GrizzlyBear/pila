import type { PasswordHasher } from "../../src/application/ports/PasswordHasher.js";
import type { SessionStore } from "../../src/application/ports/SessionStore.js";
import type { User } from "../../src/domain/user/User.js";
import type {
  NewUser,
  UserRepository,
} from "../../src/domain/user/UserRepository.js";

// Fakes: use cases only know the interfaces, so unit tests can swap in simple in-memory versions

export const plainHasher: PasswordHasher = {
  hash: async (password) => `hashed:${password}`,
  compare: async (password, hash) => hash === `hashed:${password}`,
};

function copy(user: User | undefined) {
  return user ? { ...user } : null;
}

export function fakeUsers(
  existing: User[] = [],
): UserRepository & { all: User[] } {
  const all = existing.map((user) => ({ ...user }));
  return {
    all,
    // Copies, like a database: changing a found user doesn't change the stored one
    findById: async (id) => copy(all.find((u) => u.id === id)),
    findByUsername: async (username) =>
      copy(all.find((u) => u.username === username)),
    findByEmail: async (email) => copy(all.find((u) => u.email === email)),
    list: async () => all.map((u) => ({ ...u })),
    countAdmins: async () => all.filter((u) => u.role === "admin").length,
    countActiveAdmins: async () =>
      all.filter((u) => u.role === "admin" && u.active).length,
    create: async (user: NewUser) => {
      const created: User = {
        ...user,
        id: `u${all.length + 1}`,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      all.push(created);
      return created;
    },
    update: async (id, changes) => {
      const user = all.find((u) => u.id === id);
      if (!user) return null;
      Object.assign(user, changes);
      return { ...user };
    },
    setPasswordHash: async (id, passwordHash) => {
      const user = all.find((u) => u.id === id);
      if (user) user.passwordHash = passwordHash;
    },
  };
}

// Remembers whose sessions were ended
export function fakeSessions(): SessionStore & { ended: string[] } {
  const ended: string[] = [];
  return { ended, endAllFor: async (userId) => void ended.push(userId) };
}

export function account(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    username: "maria",
    email: "maria@example.com",
    firstName: "Maria",
    lastName: "Santos",
    role: "staff",
    active: true,
    passwordHash: "hashed:password123",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
