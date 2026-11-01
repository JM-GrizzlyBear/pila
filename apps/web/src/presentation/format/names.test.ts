import { describe, expect, it } from "vitest";
import { displayName, initials } from "./names";

describe("names", () => {
  it("shows the full name, or the username when there's none", () => {
    expect(
      displayName({
        firstName: "Maria",
        lastName: "Santos",
        username: "maria",
      }),
    ).toBe("Maria Santos");
    expect(
      displayName({ firstName: "", lastName: "", username: "owner" }),
    ).toBe("owner");
  });

  it("makes initials for the badge", () => {
    expect(
      initials({ firstName: "maria", lastName: "santos", username: "maria" }),
    ).toBe("MS");
    expect(
      initials({ firstName: "Admin", lastName: "", username: "jose" }),
    ).toBe("A");
    expect(initials({ firstName: "", lastName: "", username: "jose" })).toBe(
      "JO",
    );
  });
});
