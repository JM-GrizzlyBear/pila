import { describe, expect, it } from "vitest";
import { toSafeUser } from "../../src/domain/user/User.js";
import {
  LastAdminError,
  OwnAccessError,
} from "../../src/domain/user/errors.js";
import {
  checkAccessChange,
  isEmail,
  normalizeLogin,
} from "../../src/domain/user/rules.js";
import { account } from "../fixtures/fakes.js";

describe("user rules", () => {
  it("tells a username from an email", () => {
    expect(isEmail("maria@example.com")).toBe(true);
    expect(isEmail("maria")).toBe(false);
  });

  it("compares logins without capitals or spaces", () => {
    expect(normalizeLogin("  Maria@Example.COM ")).toBe("maria@example.com");
  });

  it("never exposes the password hash", () => {
    expect(toSafeUser(account())).not.toHaveProperty("passwordHash");
  });
});

describe("who can change whose access", () => {
  const admin = { role: "admin" as const, active: true };
  const staff = { role: "staff" as const, active: true };
  const off = (a: { role: "admin" | "staff" }) => ({ ...a, active: false });

  it("lets an admin change someone else", () => {
    expect(() =>
      checkAccessChange({
        actorId: "a1",
        targetId: "u1",
        before: staff,
        after: admin,
        activeAdmins: 1,
      }),
    ).not.toThrow();
    expect(() =>
      checkAccessChange({
        actorId: "a1",
        targetId: "a2",
        before: admin,
        after: off(admin),
        activeAdmins: 2,
      }),
    ).not.toThrow();
  });

  it("doesn't let an admin lock themselves out", () => {
    for (const after of [staff, off(admin)]) {
      expect(() =>
        checkAccessChange({
          actorId: "a1",
          targetId: "a1",
          before: admin,
          after,
          activeAdmins: 2,
        }),
      ).toThrow(OwnAccessError);
    }
  });

  it("allows your own name or email change (same role, still on)", () => {
    expect(() =>
      checkAccessChange({
        actorId: "a1",
        targetId: "a1",
        before: admin,
        after: admin,
        activeAdmins: 1,
      }),
    ).not.toThrow();
  });

  it("always keeps one admin who can sign in", () => {
    for (const after of [staff, off(admin)]) {
      expect(() =>
        checkAccessChange({
          actorId: "a2",
          targetId: "a1",
          before: admin,
          after,
          activeAdmins: 1,
        }),
      ).toThrow(LastAdminError);
    }
  });
});
