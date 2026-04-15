import { describe, expect, it } from "@jest/globals";

import {
  AUTH_PRESENCE_COOKIE,
  buildLoginRedirectPath,
  getSafeNextPath,
  isSafeRelativePath,
  sanitizeRedirectPath,
} from "./redirect";

describe("auth redirect helpers", () => {
  it("exposes the auth presence cookie name", () => {
    expect(AUTH_PRESENCE_COOKIE).toBe("anualy_auth_present");
  });

  it("accepts only safe relative paths", () => {
    expect(isSafeRelativePath("/dashboard/users")).toBe(true);
    expect(isSafeRelativePath("//evil.com")).toBe(false);
    expect(isSafeRelativePath("/\\evil")).toBe(false);
    expect(isSafeRelativePath("https://evil.com")).toBe(false);
    expect(isSafeRelativePath(undefined)).toBe(false);
  });

  it("sanitizes unsafe paths with a fallback", () => {
    expect(sanitizeRedirectPath("/auth/login", "/")).toBe("/auth/login");
    expect(sanitizeRedirectPath("https://evil.com", "/dashboard")).toBe("/dashboard");
  });

  it("reuses the safe next path helper", () => {
    expect(getSafeNextPath("/dashboard?tab=users", "/")).toBe("/dashboard?tab=users");
    expect(getSafeNextPath("//evil.com", "/dashboard")).toBe("/dashboard");
  });

  it("builds login redirect URLs with an encoded next param", () => {
    expect(buildLoginRedirectPath("/dashboard/users?page=2")).toBe(
      "/auth/login?next=%2Fdashboard%2Fusers%3Fpage%3D2"
    );
    expect(buildLoginRedirectPath("https://evil.com", "/signin")).toBe(
      "/signin?next=%2F"
    );
  });
});