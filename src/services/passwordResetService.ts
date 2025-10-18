import prisma from "../lib/prisma";
import { redis } from "../lib/redis";
import { generateRandomToken } from "../utils/crypto";

const RESET_TTL = 10 * 60;

export async function createPasswordResetToken(userId: string) {
    const token = generateRandomToken(32);
    await redis.setex(`password-reset:${userId}`, RESET_TTL, token);
    return token;
}

export async function verifyPasswordResetToken(userId: string, token: string) {
    const stored = await redis.get(`password-reset:${userId}`);
    if (!stored || stored !== token) return false;
    await redis.del(`password-reset:${userId}`); // invalidate after use
    return true;
}

export async function revokeAllUserSessions(userId: string) {
    await prisma.session.updateMany({
        where: { id: userId },
        data: { revoked: true },
    });
}
