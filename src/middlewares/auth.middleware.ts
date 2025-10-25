import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../types/express";

export const isAuthenticated = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        const token =
            authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : req.cookies?.accessToken;

        if (!token) {
            return res
                .status(401)
                .json({ error: "Authorization header missing or invalid" });
        }

        const payload = verifyAccessToken(token);

        if (!payload) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        req.user = {
            id:
                (payload as any).userId ||
                (payload as any).id ||
                (payload as any).sub,
        };
        next();
    } catch (err) {
        console.error(`JWT verification error: ${err}`);
        return res.status(500).json({ error: "Unauthorized" });
    }
};
