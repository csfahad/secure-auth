import { z } from "zod";

export const registerSchema = z
    .object({
        email: z.email("Invalid email address").optional().or(z.literal("")),
        phone: z
            .string()
            .regex(/^\d{10}$/)
            .optional(),
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

export const loginSchema = z
    .object({
        email: z.email("Invalid email address").optional().or(z.literal("")),
        phone: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/)
            .optional()
            .or(z.literal("")),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (data.email) {
            if (!data.password) {
                ctx.addIssue({
                    code: "custom",
                    message: "Password is required when logging in with email",
                });
            }
        } else if (!data.phone) {
            ctx.addIssue({
                code: "custom",
                message: "Either email (with password) or phone is required",
            });
        }
    });

export const verifyOtpSchema = z.object({
    userId: z.uuid("Invalid User ID"),
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
    purpose: z
        .enum(["REGISTER", "LOGIN"])
        .refine(
            (val) => ["REGISTER", "LOGIN"].includes(val),
            "Purpose is required (REGISTER | LOGIN)"
        ),
});

export const resendOtpSchema = z.object({
    userId: z.uuid("Invalid User ID"),
    channel: z
        .enum(["email", "phone"])
        .refine(
            (val) => ["email", "phone"].includes(val),
            "Channel is required (email or phone)"
        ),
    purpose: z
        .enum(["REGISTER", "LOGIN"])
        .refine(
            (val) => ["REGISTER", "LOGIN"].includes(val),
            "Purpose is required (REGISTER | LOGIN)"
        ),
});

export const forgetPasswordSchema = z.object({
    email: z.email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    userId: z.uuid(),
    token: z.string(),
    newPassword: z.string().min(8, "Password must be atleast 8 characters"),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[!@#$%^&*?]/, {
            message:
                "Password must contain at least one special character (!@#$%^&*?)",
        }),
});
