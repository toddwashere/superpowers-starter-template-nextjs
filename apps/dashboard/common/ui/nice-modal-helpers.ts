export type NiceModalActions<TResult = unknown> = {
  resolve: (value: TResult) => void;
  hide: () => void;
};

export function resolveAndHideModal<TResult>(
  modal: NiceModalActions<TResult>,
  value: TResult,
) {
  modal.resolve(value);
  modal.hide();
}
