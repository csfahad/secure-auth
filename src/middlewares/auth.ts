import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const isAuthenticated = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ error: "Authorization header missing or invalid" });
        }

        const token = authHeader.split(" ")[1];
        const payload = verifyAccessToken(token);

        if (!payload) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        req.userId = payload.userId; // attach user id to request
        next();
    } catch (err) {
        console.error(`JWT verification error: ${err}`);
        return res.status(401).json({ error: "Unauthorized" });
    }
};
