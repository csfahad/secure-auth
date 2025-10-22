export function buildEmailContent(
    title: string,
    bodyHtml: string,
    options?: {
        accentColor?: string;
        appName?: string;
    }
) {
    const accentColor = options?.accentColor || "2563eb";
    const appName = options?.appName || "Secure Auth";

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            background-color: #f4f6f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: ${accentColor};
            color: #ffffff;
            padding: 16px 24px;
            font-size: 20px;
            font-weight: 600;
        }
        .content {
            padding: 24px;
            line-height: 1.6;
        }
        .footer {
            background: #f9fafb;
            color: #666;
            font-size: 12px;
            text-align: center;
            padding: 14px;
        }
        a {
            color: ${accentColor};
        }
        @media (max-width: 600px) {
            .container {
            margin: 10px;
            }
        }
        </style>
    </head>
    <body>
        <div class="container">
        <div class="header">${appName}</div>
        <div class="content">
            ${bodyHtml}
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
        </div>
        </div>
    </body>
    </html>
    `;
}
