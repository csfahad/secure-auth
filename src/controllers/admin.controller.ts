import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthenticatedRequest } from "../types/express";
import { updateUserRoleSchema } from "../validators/adminSchema";
import { z } from "zod";

// fetch all users (Admin and SuperAdmin only)
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({ totalUsers: users.length, users });
    } catch (err) {
        console.error("AdminController -> getAllUsers error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Update user role (SuperAdmin-only)
export const updateUserRole = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const parsed = updateUserRoleSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const { userId, role } = parsed.data;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
            },
        });

        return res.status(200).json({
            message: `User role updated to ${role}`,
            user: updatedUser,
        });
    } catch (err) {
        console.error("AdminController -> updateUserRole error:", err);

        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.message });
        }

        if ((err as any).code === "P2025") {
            // prisma: record not found
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};
