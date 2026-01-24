import { NextResponse } from 'next/server'
import { sendEmail, getResetPasswordEmailTemplate } from '@/lib/email'

export async function GET() {
  try {
    const result = await sendEmail({
      to: 'rutanenrekang2026@gmail.com',
      subject: '🔐 Test Email RUTAN Enrekang',
      html: getResetPasswordEmailTemplate(
        'http://localhost:3000/reset-password?token=abc123', 
        'Admin Test'
      )
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}