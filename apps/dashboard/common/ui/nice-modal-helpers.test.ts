import { describe, expect, it, vi } from "vitest";
import { resolveAndHideModal } from "./nice-modal-helpers";

describe("resolveAndHideModal", () => {
  it("resolves with the provided value and hides the modal", () => {
    const modal = {
      resolve: vi.fn(),
      hide: vi.fn(),
    };

    resolveAndHideModal(modal, true);

    expect(modal.resolve).toHaveBeenCalledWith(true);
    expect(modal.hide).toHaveBeenCalledOnce();
  });
});
