export interface EmailPayload {
  recipient: string | string[];
  subject: string;
  html: string;
  text: string;
  cc?: string | string[];
  replyTo?: string | string[];
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<{ id?: string }>;
}
