import { z } from "zod";

export const getAllUsersSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
    sortBy: z.enum(["name", "createdAt", "role"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
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
