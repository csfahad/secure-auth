import { Router } from "express";
import {
    login,
    logout,
    registerHandler,
    tokenRefreshHandler,
    verifyOtpHandler,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/token-refresh", tokenRefreshHandler);
router.post("/login", login);
router.post("/logout", logout);

export default router;
