import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("Login attempt:", credentials?.username);

                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const username = credentials.username as string;
                const password = credentials.password as string;

                // Admin Hardcoded Check
                if (username === "admin@remindly") {
                    if (password === "2042001") {
                        return { id: "admin-hardcoded", email: "admin@remindly", role: "ADMIN" };
                    }
                    return null;
                }

                // Standard User Parsing
                let user = null;
                if (username.includes(".com")) {
                    user = await prisma.user.findFirst({
                        where: { email: username }
                    });
                } else {
                    user = await prisma.user.findFirst({
                        where: { phoneNumber: username }
                    });
                }

                if (!user || !user.passwordHash) {
                    return null;
                }

                const bcrypt = await import("bcryptjs");
                const valid = await bcrypt.compare(password, user.passwordHash);

                if (!valid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role as string;
            }
            return session;
        }
    }
});
