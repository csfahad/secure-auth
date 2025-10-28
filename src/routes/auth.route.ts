import { Router } from "express";
import {
    changePasswordHandler,
    forgotPasswordHandler,
    loginHandler,
    logoutHandler,
    registerHandler,
    resendOtpHandler,
    resetPasswordHandler,
    tokenRefreshHandler,
    verifyOtpHandler,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import passport from "../lib/passport";
import { setAuthCookies } from "../utils/cookies";
import { googleOAuthHandler } from "../controllers/oauth.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user using email/password or phone/OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: "Secure@1234"
 *     responses:
 *       201:
 *         description: User registered successfully, OTP sent to email or phone.
 *       400:
 *         description: Validation error or user already exists.
 *       500:
 *         description: Internal server error.
 */
router.post("/register", registerHandler);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user via email/password or phone/OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "Secure@1234"
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               otp:
 *                 type: string
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: Login successful — returns JWT access & refresh tokens.
 *       401:
 *         description: Invalid credentials or OTP.
 */
router.post("/login", loginHandler);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP for registration or login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "f61a7e8e-0b1a-4f9a-81a2-b6b6e1f68a93"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       400:
 *         description: Invalid or expired OTP.
 */
router.post("/verify-otp", verifyOtpHandler);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP to email or phone
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "370817ca-caf5-4b5a-ad31-32b903c08304"
 *               channel:
 *                 type: string
 *                 enum: [email, phone]
 *                 example: "email"
 *               purpose:
 *                 type: string
 *                 enum: [REGISTER, LOGIN]
 *                 example: "LOGIN"
 *     responses:
 *       200:
 *         description: OTP resent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResendOtpResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         description: Rate limit exceeded for OTP requests.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post("/resend-otp", resendOtpHandler);

/**
 * @swagger
 * /auth/token-refresh:
 *   post:
 *     summary: Refresh access token using refresh cookie (or body)
 *     tags: [Authentication]
 *     description: |
 *       Use this endpoint to exchange a valid refresh token for a new access token.
 *       The refresh token is usually sent in an HttpOnly cookie named `refreshToken`.
 *     responses:
 *       200:
 *         description: New access token issued.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post("/token-refresh", tokenRefreshHandler);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Password reset link sent successfully.
 *       404:
 *         description: User not found.
 */
router.post("/forgot-password", forgotPasswordHandler);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password using valid token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR..."
 *               newPassword:
 *                 type: string
 *                 example: "NewSecure@1234"
 *     responses:
 *       200:
 *         description: Password reset successful.
 *       400:
 *         description: Invalid or expired token.
 */
router.post("/reset-password", resetPasswordHandler);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password for an authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "OldPass@1234"
 *               newPassword:
 *                 type: string
 *                 example: "NewPass@5678"
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       401:
 *         description: Unauthorized or invalid token.
 */
router.post("/change-password", isAuthenticated, changePasswordHandler);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out user (revoke refresh token and clear cookies)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post("/logout", logoutHandler);

// Google OAuth(web-flow) routes
// redirect user to google-login page

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects user to Google OAuth consent page.
 */
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// handle google-callback
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback endpoint
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully authenticated with Google.
 *       400:
 *         description: Invalid OAuth response.
 */
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const data = req.user as any;
        setAuthCookies(res, data.jwtToken, data.refreshTokenCookie);

        res.redirect(
            process.env.CLIENT_REDIRECT_URL || "http://localhost:3000/dashboard"
        );
    }
);

// Google OAuth (token verification - for mobile/SPA) routes
/**
 * @swagger
 * /auth/google/verify:
 *   post:
 *     summary: Verify Google ID token and sign in / register user (SPA / mobile)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleVerifyRequest'
 *     responses:
 *       200:
 *         description: Login successful via Google. Returns access token and user info.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post("/google/verify", googleOAuthHandler.verifyGoogleToken);

export default router;
