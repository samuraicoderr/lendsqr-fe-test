import { describe, expect, it } from "@jest/globals";

import FrontendLinks, { FrontendRoutes } from "./FrontendLinks";

describe("FrontendLinks", () => {
  it("exposes shared route constants", () => {
    expect(FrontendLinks.home).toBe("/");
    expect(FrontendRoutes.dashboard).toBe("/dashboard");
  });

  it("builds parameterized routes", () => {
    expect(FrontendLinks.userDetails("123")).toBe("/dashboard/users/123");
    expect(FrontendRoutes.loanRequestDetails("loan-7")).toBe("/dashboard/loan-requests/loan-7");
  });
});