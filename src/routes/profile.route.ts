import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
    getProfileHandler,
    updateProfileHandler,
} from "../controllers/auth.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management endpoints
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the logged-in user's profile details.
 *       401:
 *         description: Unauthorized.
 */
router.get("/", isAuthenticated, getProfileHandler);

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update user profile details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               bio:
 *                 type: string
 *                 example: "Full-stack developer"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1995-04-10"
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *                 example: "FEMALE"
 *               address:
 *                 type: string
 *                 example: "123 Main Street, New Delhi"
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Invalid request data.
 *       401:
 *         description: Unauthorized.
 */
router.put("/", isAuthenticated, updateProfileHandler);

export default router;
