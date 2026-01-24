'use server'

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { LogType } from "@prisma/client"
import { redirect } from "next/navigation"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus ada huruf besar")
    .regex(/[a-z]/, "Password harus ada huruf kecil")
    .regex(/[0-9]/, "Password harus ada angka")
    .regex(/[^A-Za-z0-9]/, "Password harus ada simbol (!@#$%^&*)"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  const validation = resetPasswordSchema.safeParse({ 
    token, 
    password, 
    confirmPassword 
  })
  
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error.issues[0].message 
    }
  }

  try {
    const admin = await db.admin.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        },
        resetTokenEmail: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        resetTokenEmail: true
      }
    })

    if (!admin) {
      return { 
        success: false, 
        error: "Token tidak valid atau sudah kadaluarsa." 
      }
    }

    if (admin.resetTokenEmail !== admin.email) {
      console.error(`⚠️ Email mismatch! Token: ${admin.resetTokenEmail}, Admin: ${admin.email}`)
      
      await db.admin.update({
        where: { id: admin.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
          resetTokenEmail: null,
        }
      })

      return { 
        success: false, 
        error: "Token tidak valid." 
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        resetTokenEmail: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }
    })

    // ✅ LOG: RESET_PASSWORD
    try {
      await db.systemLog.create({
        data: {
          adminId: admin.id,
          aktivitas: `Password berhasil direset untuk ${admin.username}`,
          tipe: LogType.RESET_PASSWORD
        }
      })
    } catch (logError) {
      console.error("❌ Error creating log:", logError)
    }

    console.log("✅ Password reset berhasil:", admin.username)

  } catch (error) {
    console.error("❌ Reset password error:", error)
    return { 
      success: false, 
      error: "Terjadi kesalahan." 
    }
  }

  redirect('/')
}