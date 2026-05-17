import { describe, expect, it, vi } from "vitest";
import { openAddContactFlow } from "./add-contact-flow";

describe("openAddContactFlow", () => {
  it("opens the add contact modal and navigates to the created contact", async () => {
    const showAddContactModal = vi.fn().mockResolvedValue({ id: "contact_123" });
    const router = { push: vi.fn() };

    await openAddContactFlow({
      orgSlug: "org-2",
      router,
      showAddContactModal,
    });

    expect(showAddContactModal).toHaveBeenCalledOnce();
    expect(router.push).toHaveBeenCalledWith("/org-2/contacts/contact_123");
    expect(router.push).not.toHaveBeenCalledWith("/org-2/contacts/new");
  });

  it("does not navigate when the modal is dismissed", async () => {
    const showAddContactModal = vi.fn().mockResolvedValue(undefined);
    const router = { push: vi.fn() };

    await openAddContactFlow({
      orgSlug: "org-2",
      router,
      showAddContactModal,
    });

    expect(router.push).not.toHaveBeenCalled();
  });
});
