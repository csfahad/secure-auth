import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import prisma from "../lib/prisma";
import { googleOAuthLoginSchema } from "../validators/authSchema";
import { generateAccessToken } from "../utils/jwt";
import { createSession } from "../services/sessionService";
import { setAuthCookies } from "../utils/cookies";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

export const googleOAuthController = {
    // for direct token verification (used in mobile or frontend SPA)
    async verifyGoogleToken(req: Request, res: Response) {
        const parsed = googleOAuthLoginSchema.safeParse(req.body);
        if (!parsed.success)
            return res
                .status(400)
                .json({ error: z.treeifyError(parsed.error) });

        const { tokenId } = parsed.data;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: tokenId,
                audience: process.env.GOOGLE_CLIENT_ID!,
            });

            const payload = ticket.getPayload();
            if (!payload?.email) {
                return res
                    .status(400)
                    .json({ error: "Google account has no email" });
            }

            const email = payload.email;
            const name = payload.name || "User";
            const avatarUrl = payload.picture || null;

            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        name,
                        avatarUrl,
                        isEmailVerified: true,
                        role: "USER",
                    },
                });
            }

            // link or update Account table
            await prisma.account.upsert({
                where: {
                    provider_providerAccountId: {
                        provider: "google",
                        providerAccountId: payload.sub!,
                    },
                },
                update: { accessToken: tokenId },
                create: {
                    userId: user.id,
                    provider: "google",
                    providerAccountId: payload.sub!,
                    accessToken: tokenId,
                },
            });

            // generate tokens
            const jwtToken = generateAccessToken(user.id);
            const { rawToken: refreshToken } = await createSession(user.id);

            setAuthCookies(res, jwtToken, refreshToken as string);

            return res.status(200).json({
                message: "Login successful via Google",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ message: err.message });
            }
            return res.status(500).json({ error: "Internal server error" });
        }
    },
};
