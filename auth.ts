import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Return null for missing credentials (NextAuth will handle this as CredentialsSignin)
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });

          // Return null for user not found (handled as CredentialsSignin)
          if (!user || !user?.passwordHash) {
            return null;
          }

          // Safety check: ensure user is active (this is a fallback in case login action is bypassed)
          if (!user.isActive) {
            return null;
          }

          const isCorrectPassword = await bcrypt.compare(
            password,
            user.passwordHash
          );

          // Return null for wrong password (handled as CredentialsSignin)
          if (!isCorrectPassword) {
            return null;
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error("Authentication error occurred");
          // Return null for any database/system errors
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/admin-login",
    error: "/admin-login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || "";
        token.email = user.email || "";
        token.name = user.name || "";
        token.role = user.role || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
}); 