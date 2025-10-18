import prisma from "../lib/prisma";
import { generateRandomToken, hashToken } from "../utils/crypto";
import { cleanupOtpFlags } from "./otpService";

const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS!);

export async function createSession(userId: string) {
    const raw = generateRandomToken(48);
    const hashed = hashToken(raw);
    const expiresAt = new Date(
        Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
    );

    try {
        const session = await prisma.session.create({
            data: {
                userId,
                refreshTokenHash: hashed,
                expiresAt,
            },
        });
        return { rawToken: raw, session };
    } catch (err) {
        return { error: "Unable to create session", err };
    }
}

export async function rotateSession(oldRawToken: string) {
    const oldHash = hashToken(oldRawToken);
    const oldSession = await prisma.session.findUnique({
        where: { refreshTokenHash: oldHash },
    });
    if (!oldSession) {
        return { OK: false, reason: "not_found" as const };
    }

    if (oldSession.revoked || oldSession.expiresAt < new Date()) {
        // already revoked or expired -> reuse detection
        // revoke all sessions for this user (security response)
        await prisma.session.updateMany({
            where: { userId: oldSession.userId },
            data: { revoked: true },
        });
        return {
            OK: false,
            reason: "revoked_or_expired",
            userId: oldSession.userId,
        };
    }

    // create new refresh token & session
    const raw = generateRandomToken(48);
    const hashed = hashToken(raw);
    const expiresAt = new Date(
        Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
    );

    const newSession = await prisma.session.create({
        data: {
            userId: oldSession.userId,
            refreshTokenHash: hashed,
            expiresAt,
        },
    });

    // mark old as revoked and link replacedById
    await prisma.session.update({
        where: { id: oldSession.id },
        data: { revoked: true, replacedById: newSession.id },
    });

    return { OK: true, rawToken: raw, newSession, userId: oldSession.userId };
}

export async function revokeSessionByToken(rawToken: string) {
    const hashed = hashToken(rawToken);
    const session = await prisma.session.findFirst({
        where: { refreshTokenHash: hashed, revoked: false },
        include: { user: true },
    });

    if (session) {
        await prisma.session.update({
            where: { id: session.id },
            data: { revoked: true },
        });

        await cleanupOtpFlags(session.userId);
    }
}
