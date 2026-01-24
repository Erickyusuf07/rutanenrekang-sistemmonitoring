'use server'

import { db } from "@/lib/db"
import { sendEmail, getResetPasswordEmailTemplate } from "@/lib/email"
import { randomBytes } from "crypto"
import { z } from "zod"
import { LogType } from "@prisma/client"

const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
})

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string

  const validation = forgotPasswordSchema.safeParse({ email })
  if (!validation.success) {
    return { 
      success: false, 
      error: "Format email tidak valid" 
    }
  }

  try {
    const admin = await db.admin.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        namaLengkap: true,
        username: true 
      }
    })

    if (!admin) {
      console.log(`⚠️ Forgot password attempt for unregistered email: ${email}`)
      return { 
        success: true, 
        message: "Jika email terdaftar, kami telah mengirim link reset password." 
      }
    }

    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    await db.admin.update({
      where: { id: admin.id },
      data: {
        resetToken,
        resetTokenExpiry,
        resetTokenEmail: email,
      }
    })

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    
    const emailResult = await sendEmail({
      to: admin.email,
      subject: "🔐 Reset Password - RUTAN Enrekang",
      html: getResetPasswordEmailTemplate(resetLink, admin.namaLengkap)
    })

    if (!emailResult.success) {
      console.error("❌ Email gagal dikirim:", emailResult.error)
      return { 
        success: true,
        message: "Jika email terdaftar, kami telah mengirim link reset password." 
      }
    }

    // ✅ LOG: FORGOT_PASSWORD
    try {
      await db.systemLog.create({
        data: {
          adminId: admin.id,
          aktivitas: `Request reset password dari email ${email}`,
          tipe: LogType.FORGOT_PASSWORD
        }
      })
    } catch (logError) {
      console.error("❌ Error creating log:", logError)
    }

    console.log(`✅ Reset password email sent to: ${admin.email}`)

    return { 
      success: true, 
      message: "Jika email terdaftar, kami telah mengirim link reset password." 
    }

  } catch (error) {
    console.error("❌ Forgot password error:", error)
    return { 
      success: true,
      message: "Jika email terdaftar, kami telah mengirim link reset password." 
    }
  }
}