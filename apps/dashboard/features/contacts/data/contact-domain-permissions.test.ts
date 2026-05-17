import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  archiveInteractionAction,
  createNoteAction,
  listInteractionsAction,
  updateInteractionAction,
} from "./interaction-actions";
import {
  archiveTaskAction,
  createTaskAction,
  createTaskStatusAction,
  deleteTaskStatusAction,
  listContactTasksAction,
  listOrgTasksAction,
  listTaskStatusesAction,
  updateTaskAction,
  updateTaskStatusAction,
} from "./task-actions";
import {
  commitCsvImportAction,
  exportContactsCsvAction,
  previewCsvImportAction,
} from "./csv-actions";
import {
  addTagToContactAction,
  createTagAction,
  deleteTagAction,
  listTagsAction,
  removeTagFromContactAction,
  updateTagAction,
} from "./tag-actions";
import {
  createStageAction,
  deleteStageAction,
  listStagesAction,
  updateStageAction,
} from "./stage-actions";

vi.mock("@workspace/auth/guards", () => ({
  requireOrgPermissionWithActiveOrg: vi.fn().mockResolvedValue({
    session: { user: { id: "user_1" } },
    activeOrganizationId: "org_1",
  }),
}));

vi.mock("@workspace/contacts", () => ({
  createContactInteraction: vi.fn().mockResolvedValue({ id: "interaction_1" }),
  updateContactInteraction: vi.fn().mockResolvedValue({ id: "interaction_1" }),
  archiveContactInteraction: vi.fn().mockResolvedValue({ id: "interaction_1" }),
  listContactInteractions: vi.fn().mockResolvedValue([]),
  listContactTasksForOrg: vi.fn().mockResolvedValue([]),
  listContactTasksForContact: vi.fn().mockResolvedValue([]),
  createContactTask: vi.fn().mockResolvedValue({ id: "task_1" }),
  updateContactTask: vi.fn().mockResolvedValue({ id: "task_1" }),
  archiveContactTask: vi.fn().mockResolvedValue({ id: "task_1" }),
  listContactTaskStatusesForOrg: vi.fn().mockResolvedValue([]),
  createContactTaskStatus: vi.fn().mockResolvedValue({ id: "status_1" }),
  updateContactTaskStatus: vi.fn().mockResolvedValue({ id: "status_1" }),
  deleteContactTaskStatus: vi.fn().mockResolvedValue({ id: "status_1" }),
  parseContactsCsv: vi.fn().mockReturnValue({ valid: [] }),
  exportContactsToCsv: vi.fn().mockReturnValue("displayName,kind\n"),
  createContactWithValidation: vi.fn().mockResolvedValue({ id: "contact_1" }),
  listContactsForOrg: vi.fn().mockResolvedValue([]),
  listContactTagsForOrg: vi.fn().mockResolvedValue([]),
  createContactTag: vi.fn().mockResolvedValue({ id: "tag_1" }),
  updateContactTag: vi.fn().mockResolvedValue({ id: "tag_1" }),
  deleteContactTag: vi.fn().mockResolvedValue({ id: "tag_1" }),
  addTagToContact: vi.fn().mockResolvedValue(undefined),
  removeTagFromContact: vi.fn().mockResolvedValue(undefined),
  listContactStagesForOrg: vi.fn().mockResolvedValue([]),
  createContactStage: vi.fn().mockResolvedValue({ id: "stage_1" }),
  updateContactStage: vi.fn().mockResolvedValue({ id: "stage_1" }),
  deleteContactStage: vi.fn().mockResolvedValue({ id: "stage_1" }),
}));

describe("contact domain action permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires interaction permissions for notes and interactions", async () => {
    await listInteractionsAction("contact_1");
    await createNoteAction("contact_1", "Followed up");
    await updateInteractionAction("interaction_1", { body: "Updated note" });
    await archiveInteractionAction("interaction_1");

    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(1, {
      contactInteraction: ["read"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(2, {
      contactInteraction: ["create"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(3, {
      contactInteraction: ["update"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(4, {
      contactInteraction: ["delete"],
    });
  });

  it("requires contact task permissions for task records", async () => {
    await listOrgTasksAction();
    await listContactTasksAction("contact_1");
    await createTaskAction({
      contactId: "contact_1",
      title: "Follow up",
      priority: "normal",
      sortOrder: 0,
    });
    await updateTaskAction("task_1", { title: "Follow up again" });
    await archiveTaskAction("task_1");

    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(1, {
      contactTask: ["read"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(2, {
      contactTask: ["read"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(3, {
      contactTask: ["create"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(4, {
      contactTask: ["update"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(5, {
      contactTask: ["delete"],
    });
  });

  it("requires contact settings permissions for stages and task statuses", async () => {
    await listTaskStatusesAction();
    await createTaskStatusAction({
      name: "Todo",
      color: "#6366f1",
      sortOrder: 0,
      isDefault: false,
      isTerminal: false,
    });
    await updateTaskStatusAction("status_1", { name: "Doing" });
    await deleteTaskStatusAction("status_1");
    await listStagesAction();
    await createStageAction({
      name: "Lead",
      color: "#6366f1",
      sortOrder: 0,
      isDefault: false,
    });
    await updateStageAction("stage_1", { name: "Active" });
    await deleteStageAction("stage_1");

    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(1, {
      contactSettings: ["read"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(2, {
      contactSettings: ["create"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(3, {
      contactSettings: ["update"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(4, {
      contactSettings: ["delete"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(5, {
      contactSettings: ["read"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(6, {
      contactSettings: ["create"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(7, {
      contactSettings: ["update"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(8, {
      contactSettings: ["delete"],
    });
  });

  it("requires contact read/update permissions for tags and tag assignment", async () => {
    await listTagsAction();
    await createTagAction({ name: "VIP", color: "#6366f1" });
    await updateTagAction("tag_1", { name: "Partner" });
    await deleteTagAction("tag_1");
    await addTagToContactAction("contact_1", "tag_1");
    await removeTagFromContactAction("contact_1", "tag_1");

    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(1, {
      contactSettings: ["read"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(2, {
      contactSettings: ["create"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(3, {
      contactSettings: ["update"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(4, {
      contactSettings: ["delete"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(5, {
      contact: ["update"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(6, {
      contact: ["update"],
    });
  });

  it("requires import and export permissions for CSV flows", async () => {
    await previewCsvImportAction("displayName,kind\nJane Doe,person");
    await commitCsvImportAction("displayName,kind\nJane Doe,person");
    await exportContactsCsvAction();

    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(1, {
      contact: ["import"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(2, {
      contact: ["import"],
    });
    expect(requireOrgPermissionWithActiveOrg).toHaveBeenNthCalledWith(3, {
      contact: ["export"],
    });
  });
});
