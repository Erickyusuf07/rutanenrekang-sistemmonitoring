import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // ✅ Akan pakai 465
  secure: true, // ✅ UBAH JADI TRUE untuk port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    })

    console.log('✅ Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email error:', error)
    return { success: false, error: String(error) }
  }
}

// ✅ TEMPLATE EMAIL RESET PASSWORD
export function getResetPasswordEmailTemplate(resetLink: string, name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8fafc; 
          margin: 0;
          padding: 20px; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #5E2390 0%, #7c3aed 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .content { 
          padding: 40px 30px; 
          color: #334155; 
          line-height: 1.7; 
        }
        .content p {
          margin: 15px 0;
        }
        .button { 
          display: inline-block; 
          background: #5E2390; 
          color: white !important; 
          padding: 14px 40px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 25px 0; 
          font-weight: 600;
          font-size: 16px;
        }
        .alert-box {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer { 
          text-align: center; 
          color: #94a3b8; 
          font-size: 13px; 
          padding: 30px;
          background: #f1f5f9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reset Password</h1>
        </div>
        <div class="content">
          <p>Halo <strong>${name}</strong>,</p>
          <p>Kami menerima permintaan untuk reset password akun Anda.</p>
          <p>Klik tombol di bawah untuk membuat password baru:</p>
          <center>
            <a href="${resetLink}" class="button">Reset Password Sekarang</a>
          </center>
          
          <div class="alert-box">
            <p style="margin: 0;">
              ⏰ Link ini akan kadaluarsa dalam <strong>1 jam</strong>.<br>
              🔒 Jangan bagikan link ini kepada siapapun.
            </p>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            Jika Anda tidak meminta reset password, abaikan email ini.
          </p>
        </div>
        <div class="footer">
          <p><strong>RUTAN Kelas IIB Enrekang</strong></p>
          <p>© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}