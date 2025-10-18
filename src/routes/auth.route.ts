import { Router } from "express";
import {
    forgotPasswordHandler,
    loginHandler,
    logoutHandler,
    registerHandler,
    resendOtpHandler,
    resetPasswordHandler,
    tokenRefreshHandler,
    verifyOtpHandler,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/resend-otp", resendOtpHandler);
router.post("/token-refresh", tokenRefreshHandler);
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/logout", logoutHandler);

export default router;
