import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "passport";
import swaggerUi from "swagger-ui-express";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";
import authRoutes from "./routes/auth.route";
import profileRoutes from "./routes/profile.route";
import adminRoutes from "./routes/admin.route";
import { swaggerSpec } from "./utils/swagger";

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

// Swagger docs
const theme = new SwaggerTheme();
const darkTheme = theme.getBuffer(SwaggerThemeNameEnum.DARK);
app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: darkTheme,
    })
);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
