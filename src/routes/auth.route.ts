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

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/resend-otp", resendOtpHandler);
router.post("/token-refresh", tokenRefreshHandler);
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/change-password", isAuthenticated, changePasswordHandler);
router.post("/logout", logoutHandler);

// OAuth routes
// redirect user to google-login page
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// handle google-callback
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const data = req.user as any;
        setAuthCookies(res, data.jwtToken, data.refreshTokenCookie);

        res.redirect(
            process.env.CLIENT_REDIRECT_URL || "http://localhost:5173/dashboard"
        );
    }
);
export default router;
