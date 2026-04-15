import { describe, expect, it } from "@jest/globals";

import { BackendRoutes, baseURL } from "./BackendLinks";

describe("BackendRoutes", () => {
  it("exposes the mock api base url", () => {
    expect(baseURL).toBe("/mock-api");
  });

  it("builds auth and user endpoints consistently", () => {
    expect(BackendRoutes.health).toBe("/mock-api/health");
    expect(BackendRoutes.me).toBe("/mock-api/users/me");
    expect(BackendRoutes.getUsers).toBe("/mock-api/users");
    expect(BackendRoutes.getUser("123")).toBe("/mock-api/users/123");
    expect(BackendRoutes.loginFirstFactor).toBe("/mock-api/auth/login");
    expect(BackendRoutes.refreshToken).toBe("/mock-api/auth/refreshToken");
    expect(BackendRoutes.register).toBe("/mock-api/auth/register");
  });
});