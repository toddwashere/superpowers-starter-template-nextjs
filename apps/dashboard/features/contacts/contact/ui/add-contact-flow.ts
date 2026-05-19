export type AddContactResult = { id: string };

export type AddContactFlowRouter = {
  push: (path: string) => void;
};

export async function openAddContactFlow({
  orgSlug,
  router,
  showAddContactModal,
}: {
  orgSlug: string;
  router: AddContactFlowRouter;
  showAddContactModal: () => Promise<AddContactResult | undefined>;
}) {
  const created = await showAddContactModal();
  if (!created) return;
  router.push(`/${orgSlug}/contacts/${created.id}`);
}
