import passport from "passport";
import { Strategy as GoogleStrategy, Strategy } from "passport-google-oauth20";
import prisma from "./prisma";
import { createSession } from "../services/sessionService";
import { generateAccessToken } from "../utils/jwt";

passport.use(
    new Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) return done(null, false);

                let user = await prisma.user.findUnique({ where: { email } });
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: profile.displayName || "",
                            isEmailVerified: true,
                            avatarUrl: profile.photos?.[0].value || null,
                            role: "USER",
                        },
                    });
                }

                // link google-account if not linked
                const existingAccount = await prisma.account.findFirst({
                    where: {
                        provider: "google",
                        providerAccountId: profile.id,
                    },
                });

                if (!existingAccount) {
                    await prisma.account.create({
                        data: {
                            userId: user.id,
                            provider: "google",
                            providerAccountId: profile.id,
                            accessToken,
                            refreshToken,
                        },
                    });
                }

                // generate jwt + session
                const jwtToken = generateAccessToken(user.id);
                const { rawToken: refreshTokenCookie } = await createSession(
                    user.id
                );
                return done(null, { user, jwtToken, refreshTokenCookie });
            } catch (err) {
                console.error(`Google OAuth error: ${err}`);
                return done(err, null!);
            }
        }
    )
);

export default passport;
