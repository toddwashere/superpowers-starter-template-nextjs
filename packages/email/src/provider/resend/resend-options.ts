import { keys } from "../../../keys";

export function getResendFrom(): string {
  return keys().EMAIL_FROM;
}
