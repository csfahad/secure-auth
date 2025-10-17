import { Router } from "express";
import {
    loginHandler,
    logoutHandler,
    registerHandler,
    tokenRefreshHandler,
    verifyOtpHandler,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/token-refresh", tokenRefreshHandler);
router.post("/login", loginHandler);
router.post("/logout", logoutHandler);

export default router;
