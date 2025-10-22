import { emailService } from "./index";
import { verifyOtpTemplate } from "./templates/verifyOtpTemplate";
import { resetPasswordTemplate } from "./templates/resetPasswordTemplate";
import { passwordChangedTemplate } from "./templates/passwordChangedTemplate";
import { WelcomeEmail } from "./templates/welcomeEmail";

const isProd = process.env.NODE_ENV === "production";

type TemplateType =
    | "verifyOtp"
    | "resetPassword"
    | "passwordChanged"
    | "welcome";

interface TemplateData {
    to: string;
    name?: string;
    otp?: string;
    resetLink?: string;
}

export async function sendTemplatedEmail(
    template: TemplateType,
    data: TemplateData
) {
    let content: { subject: string; html: string; text?: string };

    switch (template) {
        case "verifyOtp":
            if (!data.otp) throw new Error("Missing otp for verifyOtp");
            content = verifyOtpTemplate(data.name || "User", data.otp);
            break;

        case "resetPassword":
            if (!data.resetLink)
                throw new Error("Missing resetLink for resetPassword");
            content = resetPasswordTemplate(
                data.name || "User",
                data.resetLink
            );
            break;

        case "passwordChanged":
            content = passwordChangedTemplate(data.name || "User");
            break;

        case "welcome":
            content = WelcomeEmail(data.name || "User");
            break;

        default:
            throw new Error("Unknown template");
    }

    // Dev-mode logging
    if (!isProd) {
        console.log("[DEV EMAIL] To:", data.to);
        console.log("Subject:", content.subject);
        console.log("Text:", content.text);
        console.log("HTML:", content.html);
        return;
    }

    await emailService.sendEmail({
        to: data.to,
        subject: content.subject,
        html: content.html,
        text: content.text,
    });
}
