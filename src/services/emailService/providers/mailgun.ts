import Mailgun from "mailgun.js";
import formData from "form-data";
import { IEmailProvider, EmailPayload } from "./base";

export class MailgunProvider implements IEmailProvider {
    private client;
    private domain: string;

    constructor(apiKey: string, domain: string) {
        const mailgun = new Mailgun(formData);
        this.client = mailgun.client({ username: "api", key: apiKey });
        this.domain = domain;
    }

    async sendEmail({ to, subject, html, text }: EmailPayload): Promise<void> {
        const msg = {
            from:
                process.env.FROM_EMAIL ||
                `"Secure Auth" <no-reply@secureauth.com>`,
            to,
            subject,
            html,
            text,
        };

        if (process.env.NODE_ENV === "development") {
            console.log("[DEV MODE] Mailgun simulated email:", msg);
            return;
        }

        try {
            await this.client.messages.create(this.domain, msg);
        } catch (error: any) {
            console.error(
                "Mailgun Error:",
                error.response?.body || error.message
            );
            throw new Error("Failed to send email via Mailgun");
        }
    }
}
