import { describe, expect, it } from "vitest";
import { EnsureFirstAdmin } from "../../src/application/account/EnsureFirstAdmin.js";
import { PostgresUserRepository } from "../../src/infrastructure/database/PostgresUserRepository.js";
import { BcryptPasswordHasher } from "../../src/infrastructure/security/BcryptPasswordHasher.js";
import { NEW_ACCOUNT, PASSWORD, USERS } from "../fixtures/users.js";
import { useTestApp } from "./support/testApp.js";

const t = useTestApp();

const edit = (overrides = {}) => ({
  firstName: "Maria",
  lastName: "Santos",
  email: "maria@example.com",
  role: "staff",
  active: true,
  ...overrides,
});

describe("only admins manage accounts", () => {
  it("staff and signed-out visitors are turned away", async () => {
    expect((await t.api().get("/api/admin/accounts")).status).toBe(401);
    const maria = await t.as("maria");
    const response = await maria.get("/api/admin/accounts");
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Only admins can do that");
    expect(
      (await maria.post("/api/admin/accounts").send(NEW_ACCOUNT)).status,
    ).toBe(403);
  });

  it("an admin sees every account, admins first", async () => {
    const jose = await t.as("jose");
    const response = await jose.get("/api/admin/accounts");
    expect(response.status).toBe(200);
    expect(
      response.body.accounts.map((a: { username: string }) => a.username),
    ).toEqual(["jose", "ana", "maria"]);
  });
});

describe("adding an account", () => {
  it("the new person can sign in with the password the admin gave", async () => {
    const jose = await t.as("jose");
    const created = await jose.post("/api/admin/accounts").send(NEW_ACCOUNT);
    expect(created.status).toBe(201);
    expect(created.body.account).toMatchObject({
      username: "ben",
      firstName: "Ben",
      role: "staff",
      active: true,
    });

    const login = await t
      .api()
      .post("/api/auth/login")
      .send({ login: "ben", password: NEW_ACCOUNT.password });
    expect(login.status).toBe(200);
  });

  it("refuses a taken username, naming the field", async () => {
    const jose = await t.as("jose");
    const response = await jose
      .post("/api/admin/accounts")
      .send({ ...NEW_ACCOUNT, username: "MARIA" });
    expect(response.status).toBe(409);
    expect(response.body.errors).toHaveProperty("username");
  });
});

describe("editing an account", () => {
  it("turning someone off signs them out right away", async () => {
    const maria = await t.as("maria");
    const jose = await t.as("jose");

    const response = await jose
      .put(`/api/admin/accounts/${USERS.maria.id}`)
      .send(edit({ active: false }));
    expect(response.status).toBe(200);
    expect(response.body.account.active).toBe(false);

    expect((await maria.get("/api/auth/me")).status).toBe(401);
  });

  it("making someone an admin counts on their next request", async () => {
    const maria = await t.as("maria");
    expect((await maria.get("/api/admin/accounts")).status).toBe(403);
    const jose = await t.as("jose");
    await jose
      .put(`/api/admin/accounts/${USERS.maria.id}`)
      .send(edit({ role: "admin" }));
    expect((await maria.get("/api/admin/accounts")).status).toBe(200);
  });

  it("an admin can't lock themselves out", async () => {
    const jose = await t.as("jose");
    const response = await jose
      .put(`/api/admin/accounts/${USERS.jose.id}`)
      .send({
        firstName: "Jose",
        lastName: "Reyes",
        email: "jose@example.com",
        role: "staff",
        active: true,
      });
    expect(response.status).toBe(409);
  });

  it("an unknown or malformed id is a 404", async () => {
    const jose = await t.as("jose");
    expect(
      (
        await jose
          .put("/api/admin/accounts/00000000-0000-4000-8000-000000000099")
          .send(edit())
      ).status,
    ).toBe(404);
    expect(
      (await jose.put("/api/admin/accounts/not-an-id").send(edit())).status,
    ).toBe(404);
  });
});

describe("setting a new password", () => {
  it("only the new password works, and old sessions end", async () => {
    const maria = await t.as("maria");
    const jose = await t.as("jose");
    const response = await jose
      .put(`/api/admin/accounts/${USERS.maria.id}/password`)
      .send({ password: "brand-new-password" });
    expect(response.status).toBe(204);

    expect((await maria.get("/api/auth/me")).status).toBe(401);
    const oldPassword = await t
      .api()
      .post("/api/auth/login")
      .send({ login: "maria", password: PASSWORD });
    expect(oldPassword.status).toBe(401);
    const newPassword = await t
      .api()
      .post("/api/auth/login")
      .send({ login: "maria", password: "brand-new-password" });
    expect(newPassword.status).toBe(200);
  });
});

describe("the first admin from the ADMIN_* settings", () => {
  it("is created on an empty database, and only once", async () => {
    await t.pool.query("truncate session, users cascade");
    const ensure = new EnsureFirstAdmin(
      new PostgresUserRepository(t.pool),
      new BcryptPasswordHasher(4),
    );
    const settings = {
      username: "owner",
      email: "owner@example.com",
      password: "first-password",
    };
    expect(await ensure.execute(settings)).toBe("created");
    expect(
      await ensure.execute({ ...settings, password: "another-password" }),
    ).toBe("already there");

    const login = await t
      .api()
      .post("/api/auth/login")
      .send({ login: "owner", password: "first-password" });
    expect(login.status).toBe(200);
    expect(login.body.user.role).toBe("admin");
  });
});
