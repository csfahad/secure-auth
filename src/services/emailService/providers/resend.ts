import { Resend } from "resend";
import { IEmailProvider, EmailPayload } from "./base";

export class ResendProvider implements IEmailProvider {
    private resend: Resend;

    constructor(apiKey: string) {
        this.resend = new Resend(apiKey);
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
            console.log("[DEV MODE] Resend simulated email:", msg);
            return;
        }

        try {
            await this.resend.emails.send(msg);
        } catch (error: any) {
            console.error(
                "Resend Error:",
                error.response?.body || error.message
            );
            throw new Error("Failed to send email via Resend");
        }
    }
}
