import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { getAllUsers, updateUserRole } from "../controllers/admin.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Role-based access control (RBAC) endpoints for administrators
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin-only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns list of all users.
 *       403:
 *         description: Forbidden (insufficient permissions).
 */
router.get(
    "/users",
    isAuthenticated,
    requireRole(["ADMIN", "SUPERADMIN"]),
    getAllUsers
);

/**
 * @swagger
 * /admin/user/{id}/role:
 *   put:
 *     summary: Update user role (Admin or SuperAdmin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID whose role you want to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN, SUPERADMIN]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: User not found.
 */
router.put(
    "/users/role",
    isAuthenticated,
    requireRole(["SUPERADMIN"]),
    updateUserRole
);

export default router;
