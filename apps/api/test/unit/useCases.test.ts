import { describe, expect, it } from "vitest";
import { CreateAccount } from "../../src/application/account/CreateAccount.js";
import { EnsureFirstAdmin } from "../../src/application/account/EnsureFirstAdmin.js";
import { SetAccountPassword } from "../../src/application/account/SetAccountPassword.js";
import { UpdateAccount } from "../../src/application/account/UpdateAccount.js";
import { GetCurrentUser } from "../../src/application/user/GetCurrentUser.js";
import { LogInUser } from "../../src/application/user/LogInUser.js";
import {
  AccountNotFoundError,
  AccountTurnedOffError,
  EmailTakenError,
  InvalidCredentialsError,
  NotLoggedInError,
  OwnAccessError,
  UsernameTakenError,
} from "../../src/domain/user/errors.js";
import {
  account,
  fakeSessions,
  fakeUsers,
  plainHasher,
} from "../fixtures/fakes.js";

const maria = account();
const jose = account({
  id: "a1",
  username: "jose",
  email: "jose@example.com",
  role: "admin",
});

describe("LogInUser", () => {
  it("accepts the right password, by username or email", async () => {
    const logIn = new LogInUser(fakeUsers([maria]), plainHasher);
    for (const login of ["maria", "MARIA@example.com"]) {
      expect((await logIn.execute({ login, password: "password123" })).id).toBe(
        "u1",
      );
    }
  });

  it("refuses a wrong password and an unknown user the same way", async () => {
    const logIn = new LogInUser(fakeUsers([maria]), plainHasher);
    await expect(
      logIn.execute({ login: "maria", password: "nope" }),
    ).rejects.toThrow(InvalidCredentialsError);
    await expect(
      logIn.execute({ login: "ghost", password: "nope" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("refuses a turned-off account, but only after the right password", async () => {
    const logIn = new LogInUser(
      fakeUsers([account({ active: false })]),
      plainHasher,
    );
    await expect(
      logIn.execute({ login: "maria", password: "nope" }),
    ).rejects.toThrow(InvalidCredentialsError);
    await expect(
      logIn.execute({ login: "maria", password: "password123" }),
    ).rejects.toThrow(AccountTurnedOffError);
  });
});

describe("GetCurrentUser", () => {
  it("treats a turned-off account as signed out", async () => {
    const get = new GetCurrentUser(fakeUsers([account({ active: false })]));
    await expect(get.execute("u1")).rejects.toThrow(NotLoggedInError);
  });
});

describe("EnsureFirstAdmin", () => {
  const settings = {
    username: " Jose ",
    email: "Jose@Example.com",
    password: "a-strong-password",
  };

  it("creates the first admin when there's none", async () => {
    const users = fakeUsers([maria]);
    expect(
      await new EnsureFirstAdmin(users, plainHasher).execute(settings),
    ).toBe("created");
    expect(users.all[1]).toMatchObject({
      username: "jose",
      email: "jose@example.com",
      role: "admin",
      passwordHash: "hashed:a-strong-password",
    });
  });

  it("does nothing once an admin exists, so the settings can't overwrite anyone", async () => {
    const users = fakeUsers([jose]);
    expect(
      await new EnsureFirstAdmin(users, plainHasher).execute(settings),
    ).toBe("already there");
    expect(users.all).toHaveLength(1);
    expect(users.all[0].passwordHash).toBe("hashed:password123");
  });
});

describe("CreateAccount", () => {
  it("hashes the password and stores lowercase logins", async () => {
    const users = fakeUsers();
    await new CreateAccount(users, plainHasher).execute({
      firstName: " Ben ",
      lastName: "Lim",
      username: " Ben ",
      email: "Ben@X.com",
      role: "staff",
      password: "pw-12345",
    });
    expect(users.all[0]).toMatchObject({
      firstName: "Ben",
      username: "ben",
      email: "ben@x.com",
      role: "staff",
      active: true,
      passwordHash: "hashed:pw-12345",
    });
  });

  it("refuses a taken username or email", async () => {
    const create = new CreateAccount(fakeUsers([maria]), plainHasher);
    const base = {
      firstName: "X",
      lastName: "Y",
      role: "staff" as const,
      password: "pw-12345",
    };
    await expect(
      create.execute({ ...base, username: "maria", email: "new@x.com" }),
    ).rejects.toThrow(UsernameTakenError);
    await expect(
      create.execute({ ...base, username: "new", email: "maria@example.com" }),
    ).rejects.toThrow(EmailTakenError);
  });
});

describe("UpdateAccount", () => {
  const edit = (overrides = {}) => ({
    firstName: "Maria",
    lastName: "Santos",
    email: "maria@example.com",
    role: "staff" as const,
    active: true,
    ...overrides,
  });

  it("turning an account off signs it out everywhere", async () => {
    const sessions = fakeSessions();
    const updated = await new UpdateAccount(
      fakeUsers([jose, maria]),
      sessions,
    ).execute("a1", "u1", edit({ active: false }));
    expect(updated.active).toBe(false);
    expect(sessions.ended).toEqual(["u1"]);
  });

  it("other changes keep the person signed in", async () => {
    const sessions = fakeSessions();
    await new UpdateAccount(fakeUsers([jose, maria]), sessions).execute(
      "a1",
      "u1",
      edit({ role: "admin", lastName: "Santos-Cruz" }),
    );
    expect(sessions.ended).toEqual([]);
  });

  it("an admin can't change their own role or turn themselves off", async () => {
    const update = new UpdateAccount(fakeUsers([jose]), fakeSessions());
    const own = { firstName: "Jose", lastName: "", email: "jose@example.com" };
    await expect(
      update.execute("a1", "a1", { ...own, role: "staff", active: true }),
    ).rejects.toThrow(OwnAccessError);
    await expect(
      update.execute("a1", "a1", { ...own, role: "admin", active: false }),
    ).rejects.toThrow(OwnAccessError);
  });

  it("an admin can still fix their own name and email", async () => {
    const updated = await new UpdateAccount(
      fakeUsers([jose]),
      fakeSessions(),
    ).execute("a1", "a1", {
      firstName: "Jose",
      lastName: "Reyes",
      email: "JOSE.R@example.com",
      role: "admin",
      active: true,
    });
    expect(updated).toMatchObject({
      lastName: "Reyes",
      email: "jose.r@example.com",
    });
  });

  it("refuses an email someone else has", async () => {
    await expect(
      new UpdateAccount(fakeUsers([jose, maria]), fakeSessions()).execute(
        "a1",
        "u1",
        edit({ email: "jose@example.com" }),
      ),
    ).rejects.toThrow(EmailTakenError);
  });

  it("says when the account doesn't exist", async () => {
    await expect(
      new UpdateAccount(fakeUsers([jose]), fakeSessions()).execute(
        "a1",
        "nobody",
        edit(),
      ),
    ).rejects.toThrow(AccountNotFoundError);
  });
});

describe("SetAccountPassword", () => {
  it("sets the new password and signs the person out everywhere", async () => {
    const users = fakeUsers([jose, maria]);
    const sessions = fakeSessions();
    await new SetAccountPassword(users, plainHasher, sessions).execute(
      "a1",
      "u1",
      "new-password-1",
    );
    expect(users.all[1].passwordHash).toBe("hashed:new-password-1");
    expect(sessions.ended).toEqual(["u1"]);
  });

  it("isn't for your own password", async () => {
    await expect(
      new SetAccountPassword(
        fakeUsers([jose]),
        plainHasher,
        fakeSessions(),
      ).execute("a1", "a1", "new-password-1"),
    ).rejects.toThrow(OwnAccessError);
  });
});
