import { z } from "zod";

export const registerSchema = z
    .object({
        email: z.email("Invalid email address").optional().or(z.literal("")),
        phone: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/)
            .optional()
            .or(z.literal("")),
        password: z
            .string()
            .min(8, "Password must be atleast 8 characters")
            .optional(),
        name: z.string().min(3, "Name must be atleast 3 characters").optional(),
    })
    .refine(
        (data) => data.email || data.phone,
        "Either email or phone number is required"
    )
    .refine(
        (data) => data.password || !data.email, // password required only if email signup
        "Password required for email signup"
    );

export const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Enter valid password"),
});

export const sendOtpSchema = z.object({
    email: z.email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    otp: z
        .string()
        .length(6, "OTP must be at 6 digits long")
        .regex(/^\d+$/, "OTP must contain only digits"),
    channel: z
        .enum(["email", "phone"])
        .refine(
            (val) => ["email", "phone"].includes(val),
            "Channel is required (email or phone)"
        ),
});
