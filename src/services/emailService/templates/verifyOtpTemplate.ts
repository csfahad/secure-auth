import { buildEmailContent } from "../utils/buildEmailContent";

export const verifyOtpTemplate = (
    name: string,
    otp: string,
    appName = "Secure Auth"
) => {
    const bodyHtml = `
        <p>Hi ${name || "User"},</p>
        <p>Welcome to <b>${appName}</b>! To verify your email address, please use the OTP below:</p>
        <div style="font-size:24px;font-weight:bold;background:#f3f4f6;
                    padding:10px 20px;display:inline-block;border-radius:6px;
                    letter-spacing:4px;">
            ${otp}
        </div>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn’t request this, please ignore this message.</p>
    `;

    const subject = `${appName} - Verify your email`;
    const html = buildEmailContent("Verify Your Email", bodyHtml, { appName });
    const text = `Hi ${
        name || "User"
    },\nYour ${appName} verification code is ${otp}. It expires in 5 minutes.`;

    return { subject, html, text };
};
