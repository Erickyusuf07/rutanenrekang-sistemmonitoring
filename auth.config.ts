import type { NextAuthConfig, DefaultSession } from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt"; 

// 1. Augmentasi modul next-auth
declare module "next-auth" {
  interface User {
    role?: string;
    username?: string;
  }
  interface Session {
    user: {
      id: string;
      username?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

// 2. Augmentasi modul next-auth/jwt
declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    username?: string;
  }
}

export const authConfig = {
  providers: [],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Saat pertama kali login
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      
      // 2. Saat fungsi update() dipanggil dari halaman profil
      if (trigger === "update" && session) {
        token.name = session.user?.name || token.name;
        token.email = session.user?.email || token.email;
        token.username = session.user?.username || token.username;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string; 
        session.user.name = token.name as string; 
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
} satisfies NextAuthConfig;