import { IEmailProvider, EmailPayload } from "./providers/base";
import { NodemailerProvider } from "./providers/nodemailer";
import { ResendProvider } from "./providers/resend";
import { SendgridProvider } from "./providers/sendgrid";
import { MailgunProvider } from "./providers/mailgun";
import { GmailProvider } from "./providers/gmail";

export * from "./templates/welcomeEmail";
export * from "./templates/verifyOtpTemplate";
export * from "./templates/resetPasswordTemplate";
export * from "./templates/passwordChangedTemplate";

type ProviderType = "nodemailer" | "resend" | "sendgrid" | "mailgun" | "gmail";

class EmailService {
    private provider: IEmailProvider;

    constructor(providerType: ProviderType) {
        switch (providerType) {
            case "resend":
                this.provider = new ResendProvider(process.env.RESEND_API_KEY!);
                break;
            case "sendgrid":
                this.provider = new SendgridProvider(
                    process.env.SENDGRID_API_KEY!
                );
                break;
            case "mailgun":
                this.provider = new MailgunProvider(
                    process.env.MAILGUN_API_KEY!,
                    process.env.MAILGUN_DOMAIN!
                );
                break;
            case "gmail":
                this.provider = new GmailProvider();
                break;
            default:
                this.provider = new NodemailerProvider();
        }
    }

    async sendEmail(payload: EmailPayload): Promise<void> {
        await this.provider.sendEmail(payload);
    }
}

const selectedProvider =
    (process.env.EMAIL_PROVIDER as ProviderType) || "nodemailer";
export const emailService = new EmailService(selectedProvider);
