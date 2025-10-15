export function generateOtp(length = 6) {
    return Math.floor(100000 + Math.random() * 900000)
        .toString()
        .slice(0, length);
}

export async function sendOtp(
    destination: string,
    otp: string,
    channel: "email" | "phone"
) {
    if (process.env.NODE_ENV === "development") {
        console.log(`[DEV MODE]: OTP for ${destination}: ${otp}`);
        return;
    }

    if (channel === "email") {
        // TODO: Implement Nodemailer/Resend for prod
        console.log(`Sending OTP ${otp} to email: ${destination}`);
    } else {
        // TODO: Implement SMS Service for prod(Twilio etc.)
        console.log(`Sending OTP ${otp} to phone: ${destination}`);
    }
}
