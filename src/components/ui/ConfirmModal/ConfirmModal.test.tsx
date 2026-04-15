import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

import ConfirmModal from "./ConfirmModal";

describe("ConfirmModal", () => {
  it("does not render when closed", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { container } = render(
      <ConfirmModal
        open={false}
        title="Delete item"
        message="This cannot be undone."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders actions and triggers callbacks", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <ConfirmModal
        open
        title="Delete item"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="success"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete item")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete"));
    fireEvent.click(screen.getByText("Keep"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables actions while loading", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <ConfirmModal
        open
        title="Delete item"
        message="This cannot be undone."
        loading
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Processing..." })).toBeDisabled();
  });
});