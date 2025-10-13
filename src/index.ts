import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Public routes
app.use("/api/v1/auth", authRoutes);

// Private routes

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
