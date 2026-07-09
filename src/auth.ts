import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
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
                console.log("Mock login attempt:", credentials?.username);

                if (!credentials?.username) {
                    return null;
                }

                const username = credentials.username as string;

                // Simple check: username should contain '@' or be alphanumeric
                const isEmail = username.includes("@");

                // Find or auto-create the user in our mock database
                let user = await prisma.user.findFirst({
                    where: isEmail ? { email: username } : { phoneNumber: username }
                });

                if (!user) {
                    // Auto-create user on the fly so they can log in immediately!
                    const name = isEmail ? username.split('@')[0] : username;
                    user = await prisma.user.create({
                        data: {
                            name: name.charAt(0).toUpperCase() + name.slice(1),
                            email: isEmail ? username : `${username}@remindly.mock`,
                            phoneNumber: !isEmail ? username : null,
                            role: "USER",
                            accountStatus: "ACTIVE",
                            passwordHash: "mocked"
                        }
                    });
                }

                console.log("Mock login success for user:", user.email || user.phoneNumber);

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
