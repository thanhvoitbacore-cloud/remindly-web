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
                if (username.includes("@")) {
                    user = await prisma.user.findFirst({
                        where: { email: username }
                    });
                } else {
                    user = await prisma.user.findFirst({
                        where: { phoneNumber: username }
                    });
                }

                if (!user || !user.passwordHash) {
                    console.log("Login failed: User not found or has no password hash.");
                    return null;
                }

                const { comparePasswords } = await import("@/lib/auth");
                const valid = await comparePasswords(password, user.passwordHash);

                if (!valid) {
                    console.log("Login failed: bcrypt.compare returned false for user:", user.email || user.phoneNumber);
                    return null;
                }
                
                console.log("Login success for user:", user.email || user.phoneNumber);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.avatar
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.image = user.image;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role as string;
                if (token.image) {
                     session.user.image = token.image as string;
                }
                if (token.name) {
                     session.user.name = token.name as string;
                }
            }
            return session;
        }
    }
});
