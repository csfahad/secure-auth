import sgMail from "@sendgrid/mail";
import { IEmailProvider, EmailPayload } from "./base";

export class SendgridProvider implements IEmailProvider {
    constructor(apiKey: string) {
        sgMail.setApiKey(apiKey);
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
            console.log("[DEV MODE] SendGrid simulated email:", msg);
            return;
        }

        try {
            await sgMail.send(msg);
        } catch (error: any) {
            console.error(
                "Sendgrid Error:",
                error.response?.body || error.message
            );
            throw new Error("Failed to send email via Sendgrid");
        }
    }
}
