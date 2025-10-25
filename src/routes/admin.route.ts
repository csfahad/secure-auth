import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { getAllUsers, updateUserRole } from "../controllers/admin.controller";

const router = Router();

router.get(
    "/users",
    isAuthenticated,
    requireRole(["ADMIN", "SUPERADMIN"]),
    getAllUsers
);
router.put(
    "/users/role",
    isAuthenticated,
    requireRole(["SUPERADMIN"]),
    updateUserRole
);

export default router;
