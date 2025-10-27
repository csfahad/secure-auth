import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import profileRoutes from "./routes/profile.route";
import adminRoutes from "./routes/admin.route";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Public routes
app.use("/api/v1/auth", authRoutes);

// Private routes
app.use("/api/v1/profile", profileRoutes);

// Admin routes
app.use("/api/v1/admin", adminRoutes);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
