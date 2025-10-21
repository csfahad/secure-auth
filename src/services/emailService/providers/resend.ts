import { Resend } from "resend";
import { IEmailProvider, EmailPayload } from "./base";

export class ResendProvider implements IEmailProvider {
    private resend: Resend;

    constructor(apiKey: string) {
        this.resend = new Resend(apiKey);
    }

    async sendEmail({ to, subject, html, text }: EmailPayload): Promise<void> {
        await this.resend.emails.send({
            from:
                process.env.FROM_EMAIL ||
                `"Secure Auth" <no-reply@secureauth.com>`,
            to,
            subject,
            html,
            text,
        });
    }
}
