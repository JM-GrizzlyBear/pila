import type { Role, User } from "./User.js";

export interface NewUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  passwordHash: string;
}

export interface UserChanges {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  // Every account, admins first, then by name
  list(): Promise<User[]>;
  // How many accounts are admins (turned on or off)
  countAdmins(): Promise<number>;
  // How many admins can sign in right now
  countActiveAdmins(): Promise<number>;
  create(user: NewUser): Promise<User>;
  // null: no such account
  update(id: string, changes: UserChanges): Promise<User | null>;
  setPasswordHash(id: string, passwordHash: string): Promise<void>;
}
