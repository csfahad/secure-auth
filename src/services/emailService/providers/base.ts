export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface IEmailProvider {
    sendEmail(payload: EmailPayload): Promise<void>;
}
