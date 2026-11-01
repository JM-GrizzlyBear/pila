import {
  createAccountSchema,
  loginSchema,
  updateAccountSchema,
} from "@pila/shared";
import { describe, expect, it } from "vitest";

describe("shared form rules (used by the API and the website)", () => {
  const account = {
    firstName: " Maria ",
    lastName: "Santos",
    username: " Maria_1 ",
    email: " M@X.COM ",
    role: "staff",
    password: "12345678",
  };

  it("new account: trims and lowercases", () => {
    expect(createAccountSchema.parse(account)).toEqual({
      firstName: "Maria",
      lastName: "Santos",
      username: "maria_1",
      email: "m@x.com",
      role: "staff",
      password: "12345678",
    });
  });

  it("new account: checks each field", () => {
    const result = createAccountSchema.safeParse({
      firstName: " ",
      lastName: "",
      username: "a b",
      email: "nope",
      role: "boss",
      password: "short",
    });
    expect(result.success).toBe(false);
    expect(
      Object.keys(result.error?.flatten().fieldErrors ?? {}).sort(),
    ).toEqual([
      "email",
      "firstName",
      "lastName",
      "password",
      "role",
      "username",
    ]);
  });

  it("edit account: needs the on/off switch", () => {
    const { password: _password, username: _username, ...rest } = account;
    expect(updateAccountSchema.safeParse(rest).success).toBe(false);
    expect(
      updateAccountSchema.safeParse({ ...rest, active: false }).success,
    ).toBe(true);
  });

  it("login: needs both fields", () => {
    expect(loginSchema.safeParse({ login: "", password: "x" }).success).toBe(
      false,
    );
  });
});
