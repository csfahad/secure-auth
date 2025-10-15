import { Router } from "express";
import {
    login,
    logout,
    register,
    verifyOtpHandler,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtpHandler);
router.post("/login", login);
router.post("/logout", logout);

export default router;
