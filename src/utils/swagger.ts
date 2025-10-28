import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Secure Auth API Documentation",
            version: "1.0.0",
            description:
                "This is the official API documentation for the Secure Auth Backend.\n\nIt covers user registration, login, OTP verification, OAuth, role-based access control (RBAC), and admin management endpoints.",
            contact: {
                name: "API Support",
                email: "csfahad.dev@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1",
                description: "Development Server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                // Generic error response
                ErrorResponse: {
                    type: "object",
                    properties: {
                        status: { type: "string", example: "error" },
                        message: { type: "string", example: "Unauthorized" },
                        details: { type: "object", example: {} },
                    },
                },

                // Validation error shape
                ValidationError: {
                    type: "object",
                    properties: {
                        status: { type: "string", example: "error" },
                        message: {
                            type: "string",
                            example: "Validation failed",
                        },
                        errors: {
                            type: "object",
                            example: {
                                email: ["Required", "Invalid email format"],
                                password: ["Minimum length 8"],
                            },
                        },
                    },
                },

                // Auth success response (generic)
                AuthSuccess: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Login successful",
                        },
                        accessToken: {
                            type: "string",
                            example: "eyJhbGciOiJI...",
                        },
                        user: {
                            type: "object",
                            properties: {
                                id: { type: "string", example: "uuid" },
                                name: { type: "string", example: "John Doe" },
                                email: {
                                    type: "string",
                                    example: "john@example.com",
                                },
                                role: { type: "string", example: "USER" },
                            },
                        },
                    },
                },

                // Refresh token response
                RefreshResponse: {
                    type: "object",
                    properties: {
                        accessToken: {
                            type: "string",
                            example: "eyJhbGciOiJI...",
                        },
                        user: {
                            type: "object",
                            properties: {
                                id: { type: "string", example: "uuid" },
                                email: {
                                    type: "string",
                                    example: "john@example.com",
                                },
                                name: { type: "string", example: "John Doe" },
                                role: { type: "string", example: "USER" },
                            },
                        },
                    },
                },

                // Resend OTP response
                ResendOtpResponse: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "OTP resent to your email.",
                        },
                    },
                },

                // Logout response
                LogoutResponse: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Logged out successfully",
                        },
                    },
                },

                // Verify Google token request (mobile)
                GoogleVerifyRequest: {
                    type: "object",
                    properties: {
                        tokenId: { type: "string", example: "google-id-token" },
                    },
                    required: ["tokenId"],
                },
            },

            responses: {
                Unauthorized: {
                    description:
                        "Unauthorized (missing or invalid credentials)",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                Forbidden: {
                    description: "Forbidden (insufficient permissions)",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                ValidationError: {
                    description: "Validation error (request body or params)",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ValidationError",
                            },
                        },
                    },
                },
                InternalError: {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
    },
    apis: [path.resolve(__dirname, "../routes/*.ts")], // Auto-scan all route files
};

export const swaggerSpec = swaggerJsdoc(options);
