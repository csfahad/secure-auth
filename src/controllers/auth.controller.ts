import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../lib/prisma";
import {
    loginSchema,
    registerSchema,
    verifyOtpSchema,
    resendOtpSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
} from "../validators/authSchema";
import {
    canRequestOtp,
    generateOtp,
    sendOtp,
    storeOtp,
    verifyOtp,
} from "../services/otpService";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { setAuthCookies } from "../utils/cookies";
import {
    createSession,
    revokeSessionByToken,
    rotateSession,
} from "../services/sessionService";
import { redis } from "../lib/redis";
import {
    createPasswordResetToken,
    revokeAllUserSessions,
    verifyPasswordResetToken,
} from "../services/passwordResetService";
import { AuthenticatedRequest } from "../types/express";

const isProd = process.env.NODE_ENV === "production";

export const registerHandler = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
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
        const identifier = `${channel}:${user.id}`;
        const purpose = "REGISTER";
        const otp = generateOtp();
        await storeOtp(identifier, otp, purpose);
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
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const { userId, otp, channel, purpose } = parsed.data;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const identifier = `${channel}:${userId}`;
        const isValid = await verifyOtp(identifier, otp, purpose);
        if (!isValid)
            return res.status(400).json({ error: "Invalid or expired OTP" });

        if (purpose === "REGISTER") {
            const updateData:
                | Record<string, unknown>
                | Record<string, unknown>[] = {};
            if (channel === "email") updateData.isEmailVerified = true;
            if (channel === "phone") updateData.isPhoneVerified = true;

            await prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });

            return res.status(200).json({
                message: `${channel} verification successful.`,
            });
        }

        if (purpose === "LOGIN") {
            const accessToken = generateAccessToken(user.id);
            const { rawToken: refreshToken } = await createSession(user.id);

            // mark as verified temporarily
            await redis.setex(`otp-verified:phone:${user.id}`, 300, "true");

            setAuthCookies(res, accessToken, refreshToken as string);

            return res.status(200).json({
                message: "Login successful via OTP",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
                accessToken, // optional (useful only when using Authorization headers)
            });
        }

        return res.status(400).json({ error: "Unknown OTP purpose" });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.message });
        }
        console.error("OTP verification error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const resendOtpHandler = async (req: Request, res: Response) => {
    const parsed = resendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }
    const { userId, channel, purpose } = parsed.data;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const verified = await redis.get(`otp-verified:${channel}:${user.id}`);
        if (verified) {
            return res
                .status(400)
                .json({ error: "User already verified, cannot resend OTP." });
        }

        const identifier = `${channel}:${user.id}`;

        // rate-limit check
        const { allowed, reason } = await canRequestOtp(identifier, purpose);
        if (!allowed) {
            return res.status(429).json({
                error: `Cannot resend OTP: ${reason}`,
            });
        }

        // generate and store OTP
        const otp = generateOtp();
        await storeOtp(identifier, otp, purpose);
        if (channel === "email" && user.email)
            await sendOtp(user.email, otp, "email");
        else if (channel === "phone" && user.phone)
            await sendOtp(user.phone, otp, "phone");
        else return res.status(400).json({ error: "Missing destination" });

        return res.status(200).json({
            message: `OTP resent to your ${channel}.`,
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.message });
        }
        console.error("Resend OTP error:", err);
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

export const loginHandler = async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const { email, password, phone } = parsed.data;

    try {
        // ---------- EMAIL + PASSWORD FLOW ----------

        if (email) {
            // find user by email
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (!user || !user.passwordHash) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const isValid = await bcrypt.compare(password!, user.passwordHash);
            if (!isValid) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            // creds valid: Create session & tokens
            const accessToken = generateAccessToken(user.id);
            const { rawToken: refreshToken } = await createSession(user.id);
            setAuthCookies(res, accessToken, refreshToken as string);

            return res.status(200).json({
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
                accessToken, // optional (useful only when using Authorization headers)
            });
        }

        // ---------- PHONE (OTP) FLOW ----------
        if (phone) {
            // find or create user by phone
            let user = await prisma.user.findUnique({ where: { phone } });

            if (!user) {
                // create a minimal user for this phone number (no password)
                user = await prisma.user.create({
                    data: { phone, name: null, passwordHash: null },
                });
            }

            const otp = generateOtp();
            const channelKey = `phone:${user.id}`;
            await storeOtp(channelKey, otp, "LOGIN");
            await sendOtp(phone, otp, "phone");

            return res.status(200).json({
                message:
                    "OTP sent to your phone. Please verify using the same OTP to login.",
                userId: user.id,
            });
        }
        return res.status(400).json({ error: "Invalid login request" });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
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

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        });
        return res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(401).json({ error: "Failed to logout", err });
    }
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
    const parsed = forgetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }
    const { email } = parsed.data;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(200).json({
                message:
                    "If account exists with this email, a reset link has been sent.",
            });
        }

        const token = createPasswordResetToken(user.id);

        // in production: send email with reset-link
        const resetLink = `${
            isProd ? process.env.FRONTEND_URL : "http://localhost:3000"
        }/auth/reset-password?token=${token}&id=${user.id}`;

        // in dev mode: log it to console
        console.log(`Password reset link (dev): ${resetLink}`);

        // TODO: send email in production
        return res
            .status(200)
            .json({ message: "Password reset link sent to your email." });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const { userId, token, newPassword } = parsed.data;
    try {
        const isValid = verifyPasswordResetToken(userId, token);
        if (!isValid) {
            res.status(400).json({ error: "Invalid or expired reset token" });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = newPassword
            ? await bcrypt.hash(newPassword, salt)
            : null;

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        // revoke all sessions for this user
        await revokeAllUserSessions(userId);

        return res.status(200).json({
            message:
                "Password reset successful. You can now log in with your new password.",
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const changePasswordHandler = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const { currentPassword, newPassword } = parsed.data;

    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.passwordHash) {
            return res.status(400).json({
                error: "User not found or password-based login not enabled.",
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.passwordHash
        );
        if (!isMatch) {
            return res
                .status(400)
                .json({ error: "Current password is incorrect" });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const newPasswordHash = newPassword
            ? await bcrypt.hash(newPassword, salt)
            : null;

        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newPasswordHash },
        });

        await revokeAllUserSessions(user.id);

        return res.status(200).json({
            message: "Password changed successfully, Please login again",
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};
