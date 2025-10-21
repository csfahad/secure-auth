import nodemailer from "nodemailer";
import { IEmailProvider, EmailPayload } from "./base";

export class GmailProvider implements IEmailProvider {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    async sendEmail({ to, subject, html, text }: EmailPayload): Promise<void> {
        const msg = {
            from: process.env.FROM_EMAIL || process.env.GMAIL_USER,
            to,
            subject,
            html,
            text,
        };

        if (process.env.NODE_ENV === "development") {
            console.log("[DEV MODE] Gmail simulated email:", msg);
            return;
        }

        try {
            await this.transporter.sendMail(msg);
            console.log(`Email sent via Gmail to: ${to}`);
        } catch (error: any) {
            console.error("Gmail Send Error:", error.message);
            throw new Error("Failed to send email via Gmail");
        }
    }
}
