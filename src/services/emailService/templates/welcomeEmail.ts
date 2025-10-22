import { buildEmailContent } from "../utils/buildEmailContent";

export const WelcomeEmail = (name: string, appName = "Secure Auth") => {
    const bodyHtml = `
        <p>Hi ${name || "there"},</p>
        <p>Welcome to <b>${appName}</b>! We’re thrilled to have you on board 🎉</p>
        <p>Start exploring your dashboard and take advantage of everything we offer.</p>
        <p>Cheers,<br/>The ${appName} Team</p>
    `;
    return {
        subject: `Welcome to ${appName}!`,
        html: buildEmailContent(`Welcome to ${appName}`, bodyHtml),
        text: `Hi ${name || "there"}, welcome to ${appName}!`,
    };
};
