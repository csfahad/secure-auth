import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
    getProfileHandler,
    updateProfileHandler,
} from "../controllers/auth.controller";

const router = Router();

router.get("/", isAuthenticated, getProfileHandler);
router.put("/", isAuthenticated, updateProfileHandler);

export default router;
