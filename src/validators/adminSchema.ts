import { z } from "zod";

export const getAllUsersSchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => val > 0, "Page must be greater than 0"),

    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine(
            (val) => val > 0 && val <= 100,
            "Limit must be between 1 and 100"
        ),

    search: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
    userId: z.uuid("Invalid user Id"),
    role: z
        .enum(["USER", "ADMIN", "SUPERADMIN"])
        .refine(
            (val) => ["USER", "ADMIN", "SUPERADMIN"].includes(val),
            "Invalid role type (USER | ADMIN | SUPERADMIN)"
        ),
});
