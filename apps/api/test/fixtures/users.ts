// The seeded accounts (password for all: PASSWORD). Fixed ids so tests can refer to them.
export const PASSWORD = "password123";

export const USERS = {
  jose: {
    id: "00000000-0000-4000-8000-000000000003",
    username: "jose",
    email: "jose@example.com",
    firstName: "Jose",
    lastName: "Reyes",
    role: "admin",
  },
  maria: {
    id: "00000000-0000-4000-8000-000000000001",
    username: "maria",
    email: "maria@example.com",
    firstName: "Maria",
    lastName: "Santos",
    role: "staff",
  },
  ana: {
    id: "00000000-0000-4000-8000-000000000002",
    username: "ana",
    email: "ana@example.com",
    firstName: "Ana",
    lastName: "Cruz",
    role: "staff",
  },
} as const;

export type SeededUsername = keyof typeof USERS;

// An account an admin adds during a test (not in the seed data)
export const NEW_ACCOUNT = {
  firstName: "Ben",
  lastName: "Lim",
  username: "ben",
  email: "ben@example.com",
  role: "staff",
  password: "a-good-password",
} as const;
