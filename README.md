# Secure Auth

A comprehensive, production-ready authentication system built with Node.js, TypeScript, Express.js, Prisma, and Redis. This system provides multiple authentication methods including email/password, phone OTP, and Google OAuth, along with robust security features and email services.

## Features

### Authentication Methods

-   **Email + Password Authentication** with secure password hashing
-   **Phone Number Authentication** with OTP verification
-   **Google OAuth 2.0 Integration** with Passport.js
-   **Multi-channel OTP Support** (Email & SMS)
-   **JWT-based Authentication** with access and refresh tokens

### Security Features

-   **Password Security**: bcrypt hashing with salt rounds
-   **JWT Token Management**: Separate access and refresh tokens
-   **Session Management**: Secure session handling with Redis
-   **Rate Limiting**: Built-in OTP request rate limiting
-   **CORS Protection**: Configurable CORS settings
-   **Cookie Security**: HTTPOnly, Secure, and SameSite cookies

### Email Services

Support for multiple email providers:

-   **SendGrid** - Production email service
-   **Mailgun** - Alternative email service
-   **Resend** - Modern email API
-   **Gmail** - Gmail SMTP integration
-   **Custom SMTP** - Nodemailer with custom SMTP

### Email Templates

-   **Welcome Email** - User onboarding
-   **OTP Verification** - Account verification emails
-   **Password Reset** - Secure password reset links
-   **Password Changed** - Security notifications

### User Management

-   **Profile Management** - Update user profiles
-   **Account Verification** - Email and phone verification
-   **Password Management** - Change and reset passwords
-   **Role-based Access** - User roles and permissions
-   **Admin Panel** - Administrative functions

## Tech Stack

-   **Backend**: Node.js, Express.js, TypeScript
-   **Database**: PostgreSQL with Prisma ORM
-   **Cache/Session Store**: Redis
-   **Authentication**: JWT, Passport.js
-   **Validation**: Zod schemas
-   **Email**: Multiple provider support
-   **Security**: bcryptjs, CORS
-   **Development**: Nodemon, ts-node

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js** (v18 or higher)
-   **pnpm** (v8 or higher) - `npm install -g pnpm`
-   **PostgreSQL** (v13 or higher)
-   **Redis** (v6 or higher)
-   **Docker & Docker Compose** (optional, for containerized setup)

## Quick Start

### 1. Fork & Clone your Repository

```bash
git clone https://github.com/<your-username>/secure-auth.git
cd secure-auth
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/your_database"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Secrets (Generate secure random strings)
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Token Expiration
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV="development"

# CORS Configuration
CLIENT_REDIRECT_URL="http://localhost:3000/dashboard"

# Email Service Configuration (Choose one)
EMAIL_PROVIDER="nodemailer" # Options: nodemailer, sendgrid, mailgun, resend, gmail
FROM_EMAIL="Secure Auth <no-reply@secureauth.com>"

# SendGrid (if using SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"

# Mailgun (if using Mailgun)
MAILGUN_API_KEY="your-mailgun-api-key"
MAILGUN_DOMAIN="your-mailgun-domain"

# Resend (if using Resend)
RESEND_API_KEY="your-resend-api-key"

# Gmail (if using Gmail)
GMAIL_USER="your-gmail@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"

# Custom SMTP (if using Nodemailer with custom SMTP)
SMTP_HOST="your-smtp-host"
SMTP_PORT=587
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"

# Google OAuth (if using Google authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/v1/auth/google/callback"

# SMS Service (for phone OTP - implement as needed)
# TWILIO_ACCOUNT_SID="your-twilio-account-sid"
# TWILIO_AUTH_TOKEN="your-twilio-auth-token"
# TWILIO_PHONE_NUMBER="your-twilio-phone-number"
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)

Start PostgreSQL and Redis with Docker Compose:

```bash
# Update docker-compose.yml with your credentials first
docker-compose up -d
```

#### Option B: Local Installation

Install PostgreSQL and Redis locally, then create a database:

```sql
CREATE DATABASE your_database;
CREATE USER your_username WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_username;
```

### 5. Database Migration

```bash
# Generate Prisma client
pnpm generate

# Run database migrations
pnpm migrate

# (Optional) Open Prisma Studio to view data
pnpm studio
```

### 6. Start Development Server

```bash
pnpm dev
```

The server will start on `http://localhost:5000`

## Project Structure

```
secure-auth/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── controllers/           # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── admin.controller.ts
│   │   └── oauth.controller.ts
│   ├── lib/                   # Core libraries
│   │   ├── prisma.ts          # Database client
│   │   ├── redis.ts           # Redis client
│   │   └── passport.ts        # Passport configuration
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.middleware.ts # Authentication middleware
│   │   └── role.middleware.ts # Role-based middleware
│   ├── routes/                # API routes
│   │   ├── auth.route.ts      # Authentication routes
│   │   ├── profile.route.ts   # Profile management
│   │   └── admin.route.ts     # Admin routes
│   ├── services/              # Business logic services
│   │   ├── otpService.ts      # OTP generation/verification
│   │   ├── sessionService.ts  # Session management
│   │   ├── passwordResetService.ts
│   │   └── emailService/      # Email service providers
│   │       ├── index.ts       # Email service factory
│   │       ├── sendTemplatedEmail.ts
│   │       ├── providers/     # Email provider implementations
│   │       ├── templates/     # Email templates
│   │       └── utils/         # Email utilities
│   ├── types/                 # TypeScript type definitions
│   │   └── express.d.ts       # Express type extensions
│   ├── utils/                 # Utility functions
│   │   ├── cookies.ts         # Cookie utilities
│   │   ├── crypto.ts          # Cryptographic utilities
│   │   └── jwt.ts             # JWT utilities
│   ├── validators/            # Zod validation schemas
│   │   ├── authSchema.ts      # Authentication validation
│   │   └── adminSchema.ts     # Admin validation
│   └── index.ts               # Application entry point
├── docker-compose.yml         # Docker services
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## API Endpoints

### Authentication Endpoints

#### POST `/api/v1/auth/register`

Register a new user with email/phone and password.

**Request Body:**

```json
{
    "email": "user@example.com", // Optional (either email or phone required)
    "phone": "+1234567890", // Optional (either email or phone required)
    "password": "SecurePass123!", // Required for email signup
    "name": "John Doe" // Optional
}
```

**Response:**

```json
{
    "message": "OTP sent to your email: user@example.com, Please verify your account using the OTP delivered to you.",
    "userId": "uuid-here"
}
```

#### POST `/api/v1/auth/verify-otp`

Verify OTP for registration or login.

**Request Body:**

```json
{
    "userId": "uuid-here",
    "otp": "123456",
    "channel": "email", // "email" or "phone"
    "purpose": "REGISTER" // "REGISTER" or "LOGIN"
}
```

#### POST `/api/v1/auth/login`

Login with email/password or phone (OTP will be sent).

**Email + Password:**

```json
{
    "email": "user@example.com",
    "password": "SecurePass123!"
}
```

**Phone (OTP):**

```json
{
    "phone": "+1234567890"
}
```

#### POST `/api/v1/auth/resend-otp`

Resend OTP for verification.

**Request Body:**

```json
{
    "userId": "uuid-here",
    "channel": "email", // "email" or "phone"
    "purpose": "REGISTER" // "REGISTER" or "LOGIN"
}
```

#### POST `/api/v1/auth/forgot-password`

Request password reset email.

**Request Body:**

```json
{
    "email": "user@example.com"
}
```

#### POST `/api/v1/auth/reset-password`

Reset password using token from email.

**Request Body:**

```json
{
    "userId": "uuid-here",
    "token": "reset-token-here",
    "newPassword": "NewSecurePass123!"
}
```

#### POST `/api/v1/auth/change-password`

Change password (requires authentication).

**Request Body:**

```json
{
    "currentPassword": "CurrentPass123!",
    "newPassword": "NewSecurePass123!"
}
```

#### POST `/api/v1/auth/token-refresh`

Refresh access token using refresh token.

#### POST `/api/v1/auth/logout`

Logout and invalidate tokens.

### Google OAuth Endpoints

#### GET `/api/v1/auth/google`

Redirect to Google OAuth consent screen.

#### GET `/api/v1/auth/google/callback`

Handle Google OAuth callback.

### Profile Endpoints

#### GET `/api/v1/profile` (Protected)

Get user profile information.

#### PUT `/api/v1/profile` (Protected)

Update user profile.

**Request Body:**

```json
{
    "name": "Updated Name",
    "avatarUrl": "https://example.com/avatar.jpg",
    "bio": "User bio",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE", // "MALE", "FEMALE", "OTHER"
    "address": "123 Main St",
    "phone": "+1234567890"
}
```

### Admin Endpoints

#### GET `/api/v1/admin/users` (Admin Only)

Get all users (admin access required).

## Configuration

### Email Service Setup

Choose your preferred email service provider by setting the `EMAIL_PROVIDER` environment variable:

#### SendGrid Setup

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Set environment variables:

```env
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="Your App <no-reply@yourdomain.com>"
```

#### Mailgun Setup

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Get your API key and domain
3. Set environment variables:

```env
EMAIL_PROVIDER="mailgun"
MAILGUN_API_KEY="your-mailgun-api-key"
MAILGUN_DOMAIN="your-mailgun-domain"
FROM_EMAIL="Your App <no-reply@yourdomain.com>"
```

#### Resend Setup

1. Sign up at [Resend](https://resend.com/)
2. Create an API key
3. Set environment variables:

```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="Your App <no-reply@yourdomain.com>"
```

#### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Set environment variables:

```env
EMAIL_PROVIDER="gmail"
GMAIL_USER="your-gmail@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"
FROM_EMAIL="Your App <your-gmail@gmail.com>"
```

#### Custom SMTP Setup

```env
EMAIL_PROVIDER="nodemailer"
SMTP_HOST="your-smtp-server.com"
SMTP_PORT=587
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
FROM_EMAIL="Your App <no-reply@yourdomain.com>"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
    - Development: `http://localhost:5000/api/v1/auth/google/callback`
    - Production: `https://yourdomain.com/api/v1/auth/google/callback`
6. Set environment variables:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/v1/auth/google/callback"
```

### Database Schema

The application uses the following main database models:

-   **User**: Core user information and credentials
-   **Session**: JWT refresh token sessions
-   **Account**: OAuth account linking
-   **VerificationToken**: Email/phone verification tokens
-   **PasswordResetToken**: Password reset tokens
-   **OtpRequest**: OTP verification requests

## Security Best Practices

This application implements several security measures:

1. **Password Security**: bcrypt with salt rounds
2. **JWT Security**: Short-lived access tokens, long-lived refresh tokens
3. **Rate Limiting**: OTP request rate limiting
4. **CORS Protection**: Configurable CORS policies
5. **Input Validation**: Zod schema validation
6. **Cookie Security**: HTTPOnly, Secure, SameSite attributes
7. **Session Management**: Redis-based session storage

## Development

### Available Scripts

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run database migrations
pnpm migrate

# Open Prisma Studio
pnpm studio

# Generate Prisma client
pnpm generate
```

### Development Tips

1. **OTP in Development**: In development mode, OTPs are logged to console instead of being sent via email/SMS
2. **Email in Development**: Emails are logged to console with full HTML content for testing
3. **Hot Reload**: The development server uses nodemon for automatic restarts
4. **Database Changes**: Run `pnpm migrate` after schema changes

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
REDIS_URL="your-production-redis-url"

# Use strong, unique secrets
JWT_ACCESS_SECRET="your-production-access-secret"
JWT_REFRESH_SECRET="your-production-refresh-secret"

# Configure your production email provider
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="your-production-sendgrid-key"

# Production domain
CLIENT_REDIRECT_URL="https://yourdomain.com/dashboard"
```

### Deployment Steps

1. **Build the application**:

```bash
pnpm build
```

2. **Set production environment variables**

3. **Run database migrations**:

```bash
pnpm migrate
```

4. **Start the production server**:

```bash
pnpm start
```

### Docker Deployment

Build and run with Docker:

```bash
# Build Docker image
docker build -t secure-auth .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

1. **Database Connection Error**

    - Verify PostgreSQL is running
    - Check DATABASE_URL format
    - Ensure database exists

2. **Redis Connection Error**

    - Verify Redis is running
    - Check REDIS_URL format

3. **Email Not Sending**

    - Verify email provider credentials
    - Check FROM_EMAIL format
    - Ensure provider-specific environment variables are set

4. **Google OAuth Not Working**

    - Verify redirect URIs in Google Console
    - Check Google Client ID and Secret
    - Ensure Google+ API is enabled

5. **OTP Not Received**
    - In development, check console logs
    - Verify email provider configuration
    - Check spam folder

### Debug Mode

Enable debug logging by setting:

```env
DEBUG="*"
NODE_ENV="development"
```

## Support

For support and questions:

-   Create an issue in the [GitHub repository](https://github.com/csfahad/secure-auth/issues)
-   Check the [documentation](https://github.com/csfahad/secure-auth/wiki)
-   Review [existing issues](https://github.com/csfahad/secure-auth/issues?q=is%3Aissue)

---

**Built with ❤️ by [csfahad](https://x.com/csfahad_x)**
