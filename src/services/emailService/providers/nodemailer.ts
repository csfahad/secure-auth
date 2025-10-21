import nodemailer from "nodemailer";
import { IEmailProvider, EmailPayload } from "./base";

export class NodemailerProvider implements IEmailProvider {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendEmail(payload: EmailPayload): Promise<void> {
        const { to, subject, html, text } = payload;
        if (process.env.NODE_ENV === "development") {
            console.log("[DEV MODE] Email simulated:\n", {
                to,
                subject,
                text,
                htmlPreview: html.slice(0, 200) + "...",
            });
            return;
        }

        await this.transporter.sendMail({
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
