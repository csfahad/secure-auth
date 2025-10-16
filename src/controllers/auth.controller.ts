import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../lib/prisma";
import { registerSchema } from "../validators/authSchema";
import { generateOtp, sendOtp } from "../utils/otp";
import { storeOtp, verifyOtp } from "../utils/otpService";
import { verifyOtpSchema } from "../validators/authSchema";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { setAuthCookies } from "../utils/cookies";
import {
    revokeSessionByToken,
    rotateSession,
} from "../services/sessionService";

const isProd = process.env.NODE_ENV === "production";

export const registerHandler = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { name, email, password, phone } = parsed.data;
    try {
        if (!email && !phone) {
            return res
                .status(400)
                .json({ error: "Either email or phone number is required." });
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] },
        });
        if (existingUser) {
            return res.status(400).json({
                error: "User already exists with the given email or phone number.",
            });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = password
            ? await bcrypt.hash(password, salt)
            : null;

        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                passwordHash,
                isEmailVerified: false,
                isPhoneVerified: false,
            },
        });

        const channel = email ? "email" : "phone";
        const purpose = "REGISTER";
        const otp = generateOtp();
        await storeOtp(`${channel}:${user.id}`, otp, purpose);
        await sendOtp(email ?? phone!, otp, channel);

        return res.status(201).json({
            message: `OTP sent to your ${channel}: ${
                email ?? phone
            }, Please verify your account using the OTP delivered to you.`,
            userId: user.id,
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyOtpHandler = async (req: Request, res: Response) => {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { userId, otp, channel } = parsed.data;

    try {
        const identifier = `${channel}:${userId}`;
        const valid = await verifyOtp(identifier, otp, "REGISTER");
        if (!valid)
            return res.status(400).json({ error: "Invalid or expired OTP" });

        const user = await prisma.user.update({
            where: { id: userId },
            data:
                channel === "email"
                    ? { isEmailVerified: true }
                    : { isPhoneVerified: true },
        });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        setAuthCookies(res, accessToken, refreshToken);
        return res.status(200).json({
            message: `${
                channel === "email" ? "Email" : "Phone"
            } verified successfully`,
            user: { userId: user.id, email: user.email, phone: user.phone },
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.message });
        }
        console.error("OTP verification error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const tokenRefreshHandler = async (req: Request, res: Response) => {
    try {
        const oldRefresh = req.cookies?.refreshToken as string | undefined;
        if (!oldRefresh) {
            return res.status(401).json({ error: "No Refresh token found" });
        }

        const result = await rotateSession(oldRefresh);

        if (!result.OK) {
            // handle reuse detection
            if (
                result.reason === "revoked_or_expired" ||
                result.reason === "not_found"
            ) {
                return res.status(401).json({ error: "Invalid refresh token" });
            }
            return res.status(401).json({ error: "Could not rotate token" });
        }

        // issue new access token
        const accessToken = generateAccessToken(result.userId as string);
        setAuthCookies(res, accessToken, result.rawToken as string);
        return res.json({ accessToken });
    } catch (err) {
        console.error("Token refresh error", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    console.log(`login controller`);
};

export const logoutHandler = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.refreshToken as string | undefined;
        if (token) {
            await revokeSessionByToken(token);
        }
        // clear cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        });

        res.clearCookie("accessToken");
        return res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(401).json({ error: "Failed to logout", err });
    }
};
