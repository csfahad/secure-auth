import { z } from "zod";

export const updateUserRoleSchema = z.object({
    userId: z.uuid("Invalid user Id"),
    role: z
        .enum(["USER", "ADMIN", "SUPERADMIN"])
        .refine(
            (val) => ["USER", "ADMIN", "SUPERADMIN"].includes(val),
            "Invalid role type (USER | ADMIN | SUPERADMIN)"
        ),
});
