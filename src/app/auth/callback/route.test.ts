import { describe, expect, it } from "vitest";

import { getSafeNextPath, resolveCallbackDestination } from "./route";

describe("auth callback destination", () => {
  it("preserves a relative portal destination", () => {
    expect(getSafeNextPath("/participant?tab=schedule")).toBe(
      "/participant?tab=schedule",
    );
  });

  it.each([
    "https://attacker.example/path",
    "//attacker.example/path",
    "/\\attacker.example/path",
    "javascript:alert(1)",
    "participant",
  ])("rejects unsafe destination %s", (destination) => {
    expect(getSafeNextPath(destination)).toBe("/portal");
  });

  it("uses the portal for a missing destination", () => {
    expect(getSafeNextPath(null)).toBe("/portal");
  });
});

describe("auth callback recovery", () => {
  it("returns a readable recovery state when the code is missing", async () => {
    const destination = await resolveCallbackDestination(
      new URL("https://yogapedia.kr/auth/callback"),
      async () => ({ error: null }),
    );
    expect(destination).toBe("/login?error=missing_code&next=%2Fportal");
  });

  it("returns a recovery state when the link is expired", async () => {
    const destination = await resolveCallbackDestination(
      new URL("https://yogapedia.kr/auth/callback?code=expired"),
      async () => ({ error: new Error("expired") }),
    );
    expect(destination).toBe("/login?error=invalid_or_expired_link&next=%2Fportal");
  });

  it("continues to the safe destination after exchange", async () => {
    const destination = await resolveCallbackDestination(
      new URL("https://yogapedia.kr/auth/callback?code=valid&next=/participant"),
      async () => ({ error: null }),
    );
    expect(destination).toBe("/participant");
  });
});
