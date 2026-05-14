import { describe, expect, it, vi } from "vitest";

vi.mock("../data/api-key-actions", () => ({
  createOrgApiKeyAction: vi.fn(),
  createPersonalApiKeyAction: vi.fn(),
}));

import { finishApiKeyCreateModal } from "./api-key-create-modal";

describe("finishApiKeyCreateModal", () => {
  it("resolves and hides the modal", () => {
    const modal = {
      resolve: vi.fn(),
      hide: vi.fn(),
    };

    finishApiKeyCreateModal(modal);

    expect(modal.resolve).toHaveBeenCalledWith(true);
    expect(modal.hide).toHaveBeenCalledOnce();
  });
});
