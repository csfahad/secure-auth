import { redis } from "../lib/redis";

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

export async function storeOtp(
    identifier: string,
    otp: string,
    purpose: string
) {
    const key = `otp:${purpose}:${identifier}`;
    await redis.set(key, otp, "EX", OTP_TTL_SECONDS);
}

export async function verifyOtp(
    identifier: string,
    otp: string,
    purpose: string
): Promise<boolean> {
    const key = `otp:${purpose}:${identifier}`;
    const stored = await redis.get(key);
    if (!stored) return false;
    if (stored !== otp) return false;

    await redis.del(key);
    return true;
}
