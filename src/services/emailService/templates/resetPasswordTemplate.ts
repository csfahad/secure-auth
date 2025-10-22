import { buildEmailContent } from "../utils/buildEmailContent";

export const resetPasswordTemplate = (
    name: string,
    resetLink: string,
    appName = "Secure Auth"
) => {
    const bodyHtml = `
        <p>Hi ${name || "User"},</p>
        <p>We received a request to reset your password. Click the button below to set a new one:</p>
        <p>
        <a href="${resetLink}" target="_blank"
            style="background:#2563eb;color:#fff;padding:10px 20px;
                    text-decoration:none;border-radius:6px;display:inline-block;">
            Reset Password
        </a>
        </p>
        <p>This link will expire soon. If you didn’t request a password reset, please ignore this email.</p>
    `;

    const subject = `${appName} - Reset your password`;
    const html = buildEmailContent("Password Reset Request", bodyHtml, {
        appName,
    });
    const text = `Hi ${name || "User"}, Reset your password here: ${resetLink}`;

    return { subject, html, text };
};
