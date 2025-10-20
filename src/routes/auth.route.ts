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

export default router;
