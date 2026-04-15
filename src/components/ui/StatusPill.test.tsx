import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import StatusPill from "./StatusPill";

describe("StatusPill", () => {
  it("renders normalized known statuses with their mapped colors", () => {
    render(<StatusPill status="Under Review" />);

    expect(screen.getByText("Under Review")).toHaveStyle({
      backgroundColor: "rgba(233, 178, 0, 0.1)",
      color: "#E9B200",
    });
  });

  it("falls back to the default status style for unknown values", () => {
    render(<StatusPill status="Something New" />);

    expect(screen.getByText("Something New")).toHaveStyle({
      backgroundColor: "rgba(84, 95, 125, 0.06)",
      color: "#545F7D",
    });
  });
});