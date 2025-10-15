import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../db/prisma";
import { registerSchema } from "../validators/authSchema";
import { generateOtp, sendOtp } from "../utils/otp";
import { storeOtp, verifyOtp } from "../utils/otpService";
import { verifyOtpSchema } from "../validators/authSchema";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { setAuthCookies } from "../utils/cookies";

export const register = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { name, email, password, phone } = parsed.data;
    try {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] },
        });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists." });
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
        const otp = generateOtp();
        await storeOtp(`${channel}:${user.id}`, otp, "REGISTER");
        await sendOtp(email ?? phone!, otp, channel);

        return res.status(201).json({
            message: `User registered, Please verify your account. OTP sent to ${
                email ?? phone
            }`,
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

export const login = async (req: Request, res: Response) => {
    console.log(`login controller`);
};

export const logout = async (req: Request, res: Response) => {
    console.log(`logout controller`);
};
