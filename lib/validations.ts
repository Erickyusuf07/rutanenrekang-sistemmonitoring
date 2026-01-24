// lib/validations.ts
import { z } from "zod";

// Aturan Password Kuat: Min 8 karakter, ada huruf besar, huruf kecil, angka, dan simbol.
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const profileSchema = z.object({
  namaLengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  username: z.string().min(4, "Username min 4 karakter").regex(/^[a-zA-Z0-9_]+$/, "Username tidak boleh pakai spasi"),
  passwordBaru: z.string().optional().refine((val) => !val || passwordRegex.test(val), {
    message: "Password min 8 karakter, wajib ada huruf Besar, Kecil, Angka, & Simbol (@$!%*?&)",
  }),
});