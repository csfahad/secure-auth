import { buildEmailContent } from "../utils/buildEmailContent";

export const passwordChangedTemplate = (
    name: string,
    appName = "Secure Auth"
) => {
    const bodyHtml = `
    <p>Hi ${name || "User"},</p>
    <p>Your password for <b>${appName}</b> has been successfully changed.</p>
    <p>If you didn’t make this change, please contact our support team immediately.</p>
    <p>Stay secure,<br/>The ${appName} Team</p>
  `;

    return {
        subject: "Your Password Has Been Changed",
        html: buildEmailContent("Password Changed", bodyHtml),
        text: `Hi ${
            name || "User"
        }, your ${appName} password has been changed.`,
    };
};
