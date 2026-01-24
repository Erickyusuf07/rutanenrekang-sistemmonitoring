import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Logika database & bcrypt tetap di sini karena file ini 
        // hanya dipanggil di Server Actions/API (Node.js runtime)
        const admin = await db.admin.findFirst({
          where: { OR: [{ username: credentials.identifier as string }, { email: credentials.identifier as string }] }
        });

        if (!admin || !admin.password) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password as string, admin.password);
        if (!isPasswordValid) return null;

        return { id: admin.id, name: admin.namaLengkap, email: admin.email, role: admin.role };
      },
    }),
  ],
});