// actions/profile.ts
"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { profileSchema } from "@/lib/validations";

// ==========================================
// 1. FUNGSI UPDATE DATA (DAN KIRIM OTP JIKA GANTI EMAIL)
// ==========================================
export async function requestUpdateProfile(prevState: unknown, formData: FormData) {
  try {
    const session = await auth();
    const id = session?.user?.id;
    if (!id) return { error: "Sesi tidak valid. Silakan login ulang." };

    const rawData = {
      namaLengkap: formData.get("namaLengkap") as string,
      username: formData.get("username") as string,
      email: (formData.get("email") as string).toLowerCase().trim(),
      passwordBaru: formData.get("passwordBaru") as string,
    };

    // Validasi input menggunakan Zod
    const validatedData = profileSchema.safeParse(rawData);
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message };
    }

    const { namaLengkap, email, passwordBaru, username } = validatedData.data;
    // Ambil data admin saat ini
    const currentAdmin = await db.admin.findUnique({ where: { id } });
    if (!currentAdmin) return { error: "Akun tidak ditemukan." };
    
    if (username !== currentAdmin.username) {
      const existingUser = await db.admin.findUnique({ where: { username } });
      if (existingUser) return { error: "Username sudah digunakan." };
    }
    // Siapkan data yang pasti diupdate (Nama & Password)
    const updateData: { namaLengkap: string; password?: string; username?: string } = {
      namaLengkap,
      username,
    };
    if (passwordBaru) {
      updateData.password = await bcrypt.hash(passwordBaru, 10);
    }

    // CEK JIKA EMAIL BERUBAH
    if (email !== currentAdmin.email) {
      // Cek apakah email baru sudah dipakai orang lain
      const existingEmail = await db.admin.findUnique({ where: { email } });
      if (existingEmail)
        return { error: "Email sudah digunakan oleh akun lain." };

      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

      // Simpan data + token ke database
      await db.admin.update({
        where: { id },
        data: {
          ...updateData,
          resetToken: otp,
          resetTokenExpiry: expiry,
          resetTokenEmail: email, // Simpan email baru di kolom sementara
        },
      });

      // Kirim OTP ke email BARU
      await sendEmail({
        to: email,
        subject: "Kode Verifikasi Ganti Email",
        html: `Kode OTP Anda adalah: ${otp}. Kode ini berlaku 10 menit.`,
      });

      return {
        success: true,
        requireOTP: true,
        message: "OTP telah dikirim ke email baru Anda.",
      };
    }

    // JIKA EMAIL TIDAK BERUBAH (Langsung Update)
    await db.admin.update({ where: { id }, data: updateData });
    return {
      success: true,
      requireOTP: false,
      message: "Profil berhasil diperbarui!",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Terjadi kesalahan server saat memperbarui profil." };
  }
}

// ==========================================
// 2. FUNGSI VERIFIKASI OTP
// ==========================================
export async function verifyEmailChangeOTP(prevState: unknown, formData: FormData) {
  try {
    const session = await auth();
    const id = session?.user?.id;
    if (!id) return { error: "Sesi tidak valid." };

    const otp = formData.get("otp") as string;
    const admin = await db.admin.findUnique({ where: { id } });

    // Cek kecocokan OTP dan waktu kadaluarsa
    if (
      !admin?.resetToken ||
      admin.resetToken !== otp ||
      !admin.resetTokenExpiry ||
      admin.resetTokenExpiry < new Date()
    ) {
      return { error: "Kode OTP salah atau sudah kadaluarsa!" };
    }

    // Jika berhasil: Pindahkan email sementara jadi email utama, hapus token.
    await db.admin.update({
      where: { id },
      data: {
        email: admin.resetTokenEmail!,
        resetToken: null,
        resetTokenExpiry: null,
        resetTokenEmail: null,
      },
    });

    return {
      success: true,
      message: "Email berhasil diubah dan profil diperbarui!",
    };
  } catch {
    return { error: "Gagal memverifikasi OTP." };
  }
}
