'use server'

import { signIn, signOut } from "@/auth"; // Impor dari file auth.ts yang kita buat sebelumnya
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  try {
    // NextAuth akan menangani pengecekan DB, hashing password, dan pembuatan cookie secara otomatis
    await signIn("credentials", {
      identifier: formData.get("identifier"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Username/Email atau password salah" };
        default:
          return { error: "Terjadi kesalahan sistem saat login" };
      }
    }
    // Sangat penting untuk melempar error agar redirect Next.js berfungsi
    throw error;
  }
}

export async function logoutAction() {
  // signOut akan menghapus cookie session secara otomatis
  await signOut({ redirectTo: "/" });
}