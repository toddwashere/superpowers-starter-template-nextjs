import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  archiveContactAction,
  createContactAction,
  getContactAction,
  listContactsAction,
  updateContactAction,
} from "./contact-actions";

vi.mock("@workspace/auth/guards", () => ({
  requireOrgPermissionWithActiveOrg: vi.fn().mockResolvedValue({
    session: { user: { id: "user_1" } },
    activeOrganizationId: "org_1",
  }),
}));

vi.mock("@workspace/contacts", () => ({
  listContactsForOrg: vi.fn().mockResolvedValue([]),
  getContactById: vi.fn().mockResolvedValue({ id: "contact_1" }),
  createContactWithValidation: vi.fn().mockResolvedValue({ id: "contact_1" }),
  updateContactWithValidation: vi.fn().mockResolvedValue({ id: "contact_1" }),
  archiveContact: vi.fn().mockResolvedValue({ id: "contact_1" }),
}));

describe("contact actions permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires contact read permission for list and get", async () => {
    await listContactsAction();
    await getContactAction("contact_1");

    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(1, {
      contact: ["read"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(2, {
      contact: ["read"],
    });
  });

  it("requires contact create permission for create", async () => {
    await createContactAction({
      kind: "person",
      displayName: "Jane Doe",
    });

    expect(requireOrgPermissionWithActiveOrg).toHaveBeenCalledWith({
      contact: ["create"],
    });
  });

  it("requires contact update permission for update", async () => {
    await updateContactAction("contact_1", { displayName: "Jane Updated" });

    expect(requireOrgPermissionWithActiveOrg).toHaveBeenCalledWith({
      contact: ["update"],
    });
  });

  it("requires contact delete permission for archive", async () => {
    await archiveContactAction("contact_1");

    expect(requireOrgPermissionWithActiveOrg).toHaveBeenCalledWith({
      contact: ["delete"],
    });
  });
});
