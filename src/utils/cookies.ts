import { Response } from "express";

const isProd = process.env.NODE_ENV === "production";
const ACCESS_MAX_AGE = 15 * 60 * 1000;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
) {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: ACCESS_MAX_AGE, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: REFRESH_MAX_AGE, // 7 days
    });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
    });
}
