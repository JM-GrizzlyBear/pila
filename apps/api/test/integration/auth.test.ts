import { describe, expect, it } from "vitest";
import { PASSWORD, USERS } from "../fixtures/users.js";
import { useTestApp } from "./support/testApp.js";

const t = useTestApp();

describe("sign in and out", () => {
  it("signs in with a username or an email, ignoring capitals", async () => {
    for (const login of ["maria", "MARIA@example.com"]) {
      const response = await t
        .api()
        .post("/api/auth/login")
        .send({ login, password: PASSWORD });
      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: USERS.maria.id,
        firstName: "Maria",
        lastName: "Santos",
        role: "staff",
        active: true,
      });
      expect(response.body.user).not.toHaveProperty("passwordHash");
    }
  });

  it("gives the same answer for a wrong password and an unknown user", async () => {
    const wrong = await t
      .api()
      .post("/api/auth/login")
      .send({ login: "maria", password: "wrong-password" });
    const unknown = await t
      .api()
      .post("/api/auth/login")
      .send({ login: "nobody", password: "wrong-password" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it("refuses a turned-off account", async () => {
    await t.pool.query("update users set active = false where id = $1", [
      USERS.maria.id,
    ]);
    const response = await t
      .api()
      .post("/api/auth/login")
      .send({ login: "maria", password: PASSWORD });
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/turned off/);
  });

  it("signing out ends the session", async () => {
    const maria = await t.as("maria");
    expect((await maria.get("/api/auth/me")).status).toBe(200);
    expect((await maria.post("/api/auth/logout")).status).toBe(204);
    expect((await maria.get("/api/auth/me")).status).toBe(401);
  });
});

describe("no public sign-up", () => {
  it("there's no register route", async () => {
    const response = await t.api().post("/api/auth/register").send({
      username: "ben",
      email: "ben@example.com",
      password: "a-good-password",
    });
    expect(response.status).toBe(404);
  });
});
