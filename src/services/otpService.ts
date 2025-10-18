import { redis } from "../lib/redis";

const OTP_TTL = 5 * 60; // 5 min expiry
const RATE_LIMIT_TTL = 60; // 1 min cooldown between requests
const HOUR_RATE_LIMIT_TTL = 3600;
const MAX_REQUESTS_PER_HOUR = 5; // optional upper limit

// key helpers
const otpKey = (purpose: string, identifier: string) =>
    `otp:${purpose}:${identifier}`;
const rateKey = (identifier: string) => `otp-rate:${identifier}`;
const hourlyKey = (identifier: string) => `otp-hourly:${identifier}`;

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
    const key = otpKey(purpose, identifier);
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
    const key = otpKey(purpose, identifier);
    const storedOtp = await redis.get(key);

    if (!storedOtp) return false;
    if (storedOtp !== otp) return false;

    // Delete OTP and cleanup rate/hourly counters atomically
    const pipeline = redis.multi();
    pipeline.del(key);
    pipeline.del(rateKey(identifier));
    pipeline.del(hourlyKey(identifier));
    await pipeline.exec();

    return true;
}

export async function canRequestOtp(
    identifier: string,
    purpose?: "REGISTER" | "LOGIN"
) {
    // if user already has a valid OTP in Redis, don't resend
    if (purpose) {
        const existingOtp = await redis.get(otpKey(purpose, identifier));
        if (existingOtp) {
            return { allowed: false, reason: "active_otp" };
        }
    }

    const rKey = rateKey(identifier);
    const currentCount = await redis.incr(rKey);

    if (currentCount === 1) {
        await redis.expire(rKey, RATE_LIMIT_TTL);
    }

    // 1 request/minute limit
    if (currentCount > 1) {
        return { allowed: false, reason: "rate_limit_minute" };
    }

    // hourly hard limit
    const hKey = hourlyKey(identifier);
    const hourlyCount = await redis.incr(hKey);

    if (hourlyCount === 1) {
        await redis.expire(hKey, HOUR_RATE_LIMIT_TTL);
    }

    if (hourlyCount > MAX_REQUESTS_PER_HOUR) {
        return { allowed: false, reason: "rate_limit_hour" };
    }

    return { allowed: true };
}

export async function cleanupOtpFlags(userId: string) {
    const keys = [
        `otp-verified:phone:${userId}`,
        `otp-verified:email:${userId}`,
        `otp-rate:phone:${userId}`,
        `otp-rate:email:${userId}`,
        `otp-hourly:phone:${userId}`,
        `otp-hourly:email:${userId}`,
    ];
    try {
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (err) {
        console.error("Redis cleanup failed:", err);
    }
}
