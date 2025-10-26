import { Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "../lib/prisma";
import { AuthenticatedRequest } from "../types/express";
import {
    getAllUsersSchema,
    updateUserRoleSchema,
} from "../validators/adminSchema";

// fetch all users (Admin and SuperAdmin only)
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    const parsed = getAllUsersSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(401).json({ error: z.treeifyError(parsed.error) });
    }

    const { page, limit, search, sortBy, sortOrder, role } = parsed.data;

    const skip = (page - 1) * limit;
    const iMode: Prisma.QueryMode = "insensitive";

    const where: Prisma.UserWhereInput = {
        ...(role ? { role } : {}),
        ...(search
            ? {
                  OR: [
                      { name: { contains: search, mode: iMode } },
                      { email: { contains: search, mode: iMode } },
                      { phone: { contains: search, mode: iMode } },
                  ],
              }
            : {}),
    };

    const orderByField =
        sortBy && ["name", "createdAt", "role"].includes(sortBy)
            ? sortBy
            : "createdAt";

    const orderByOrder = sortOrder === "asc" ? "asc" : "desc";

    try {
        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                },
                orderBy: { [orderByField]: orderByOrder },
            }),
            prisma.user.count({ where }),
        ]);

        return res.status(200).json({
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            users,
        });
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
