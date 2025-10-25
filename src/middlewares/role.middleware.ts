import { Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { AuthenticatedRequest } from "../types/express";

export function requireRole(roles: ("USER" | "ADMIN" | "SUPERADMIN")[]) {
    return async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    message: "Access denied: insufficient privileges",
                });
            }
            req.user = user;
            next();
        } catch (err) {
            console.error("Role middleware error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    };
}
