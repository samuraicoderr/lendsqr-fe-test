import { describe, expect, it } from "@jest/globals";

import { cn, interpretServerError } from "./utils";

describe("cn", () => {
  it("merges conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4", "text-sm")).toBe("px-4 text-sm");
  });

  it("keeps non-empty conditional classes", () => {
    expect(cn("flex", false && "hidden", "items-center")).toBe("flex items-center");
  });
});

describe("interpretServerError", () => {
  it("collects messages from nested objects and arrays", () => {
    const error = {
      message: "Request failed",
      errors: ["Missing email", 422],
      nested: {
        detail: "Invalid payload",
      },
    };

    expect(interpretServerError(error)).toEqual([
      "Request failed",
      "Missing email",
      "422",
      "Invalid payload",
    ]);
  });

  it("stops on circular references", () => {
    const error: Record<string, unknown> = { message: "Boom" };
    error.self = error;

    expect(interpretServerError(error)).toEqual(["Boom"]);
  });
});