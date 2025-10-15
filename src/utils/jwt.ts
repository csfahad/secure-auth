import * as jwt from "jsonwebtoken";

const ACCESS_SECRET: jwt.Secret = process.env.JWT_ACCESS_SECRET as jwt.Secret;
const REFRESH_SECRET: jwt.Secret = process.env.JWT_REFRESH_SECRET as jwt.Secret;

export function generateAccessToken(userId: string) {
    const expiresIn = process.env
        .ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"];
    return jwt.sign({ sub: userId }, ACCESS_SECRET, {
        expiresIn,
    });
}

export function generateRefreshToken(userId: string) {
    const expiresIn = process.env
        .REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"];
    return jwt.sign({ sub: userId }, REFRESH_SECRET, {
        expiresIn,
    });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_SECRET);
}
