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
            console.log("[DEV MODE] Custom Nodemailer Email simulated:\n", msg);
            return;
        }

        try {
            await this.transporter.sendMail(msg);
        } catch (error: any) {
            console.error(
                "Custom Nodemailer Error:",
                error.response?.body || error.message
            );
            throw new Error("Failed to send email via Custom Nodemailer");
        }
    }
}
