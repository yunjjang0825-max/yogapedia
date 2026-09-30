import { describe, expect, it } from "vitest";

import { getPortalPath, isRoleAllowed } from "./roles";

describe("role routing", () => {
  it.each([
    ["participant", "/participant"],
    ["instructor", "/instructor"],
    ["organization_manager", "/organization"],
    ["admin", "/admin"],
  ] as const)("routes %s to %s", (role, path) => {
    expect(getPortalPath(role)).toBe(path);
  });

  it("denies roles outside the allowlist", () => {
    expect(isRoleAllowed("participant", ["admin"])).toBe(false);
    expect(isRoleAllowed("admin", ["admin"])).toBe(true);
  });
});
