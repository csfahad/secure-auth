import { emailService } from "./index";
import { verifyEmailOtpTemplate } from "./templates/verifyEmailOtpTemplate";
import { resetPasswordTemplate } from "./templates/resetPasswordTemplate";
import { passwordChangedTemplate } from "./templates/passwordChangedTemplate";
import { WelcomeEmail } from "./templates/welcomeEmail";

type TemplateType =
    | "resetPassword"
    | "verifyOtp"
    | "passwordChanged"
    | "welcome";

interface TemplateData {
    to: string;
    name?: string;
    otp?: string;
    resetLink?: string;
    verifyLink?: string;
}

export async function sendTemplatedEmail(
    template: TemplateType,
    data: TemplateData
) {
    let content;

    switch (template) {
        case "resetPassword":
            if (!data.resetLink)
                throw new Error("Missing resetLink for forgotPassword");
            content = resetPasswordTemplate(
                data.name || "User",
                data.resetLink
            );
            break;
        case "verifyOtp":
            if (!data.verifyLink)
                throw new Error("Missing verifyLink for verifyEmail");
            content = verifyEmailOtpTemplate(
                data.name || "User",
                data.verifyLink
            );
            break;
        case "passwordChanged":
            content = passwordChangedTemplate(data.name || "User");
            break;
        case "welcome":
            content = WelcomeEmail(data.name || "User");
            break;
        default:
            throw new Error("Unknown email template");
    }

    await emailService.sendEmail({
        to: data.to,
        subject: content.subject,
        html: content.html,
        text: content.text,
    });
}
