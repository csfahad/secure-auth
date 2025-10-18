import { redis } from "../lib/redis";

const OTP_TTL = 5 * 60; // 5 min expiry
const RATE_LIMIT_TTL = 60; // 1 min cooldown between requests
const HOUR_RATE_LIMIT_TTL = 3600;
const MAX_REQUESTS_PER_HOUR = 5; // optional upper limit

export function generateOtp(length = 6) {
    return Math.floor(100000 + Math.random() * 900000)
        .toString()
        .slice(0, length);
}

export async function storeOtp(
    identifier: string,
    otp: string,
    purpose: "REGISTER" | "LOGIN"
) {
    const key = `otp:${purpose}:${identifier}`;
    await redis.setex(key, OTP_TTL, otp);
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

export async function verifyOtp(
    identifier: string,
    otp: string,
    purpose: "REGISTER" | "LOGIN"
): Promise<boolean> {
    const key = `otp:${purpose}:${identifier}`;
    const storedOtp = await redis.get(key);
    if (storedOtp && storedOtp === otp) {
        await redis.del(key);
        return true;
    }
    return false;
}

export async function canRequestOtp(identifier: string) {
    const rateKey = `otp-rate:${identifier}`;
    const currentCount = await redis.incr(rateKey);

    if (currentCount === 1) {
        await redis.expire(rateKey, RATE_LIMIT_TTL);
    }

    // 1 request/minute limit
    if (currentCount > 1) {
        return false;
    }

    // hourly hard limit
    const hourKey = `otp-hourly:${identifier}`;
    const hourlyCount = await redis.incr(hourKey);

    if (hourlyCount === 1) {
        await redis.expire(hourKey, HOUR_RATE_LIMIT_TTL);
    }

    if (hourlyCount > MAX_REQUESTS_PER_HOUR) {
        return false;
    }

    return true;
}
