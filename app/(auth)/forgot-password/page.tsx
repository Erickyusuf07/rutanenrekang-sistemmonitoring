'use client'

import { useState } from "react"
import { forgotPasswordAction } from "@/actions/forgot-password-actions"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative w-full overflow-hidden rounded-xl bg-[#5E2390] py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/30 transition-all hover:bg-[#4a1b73] hover:shadow-purple-900/50 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            MENGIRIM EMAIL...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            KIRIM LINK RESET
          </>
        )}
      </span>
    </button>
  )
}

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setMessage("")
    setError("")
    setSuccess(false)

    const result = await forgotPasswordAction(formData)
    
    if (result.success) {
      setSuccess(true)
      setMessage(result.message || "")
    } else {
      setError(result.error || "Terjadi kesalahan")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2E1065] via-[#4C1D95] to-[#0F172A] p-4">
      
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl transition-all duration-300 md:max-w-md">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 shadow-inner backdrop-blur-md">
            <Mail className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-wide text-white">
            LUPA PASSWORD
          </h1>
          <p className="mt-2 text-sm text-orange-100">
            Masukkan email Anda untuk reset password
          </p>

          <div className="absolute -bottom-1 left-0 right-0 h-6 bg-white/95" style={{ clipPath: "polygon(0 100%, 100% 100%, 50% 0)" }}></div>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-10 pt-6">
          
          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900">Email Terkirim!</p>
                <p className="text-sm text-green-700 mt-1">{message}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600 border border-red-200 flex items-center justify-center gap-2">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          {!success && (
            <form action={handleSubmit} className="space-y-6">
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-orange-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                  placeholder="Email Anda"
                />
              </div>

              <SubmitButton />
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="text-sm font-semibold text-[#5E2390] hover:text-[#4a1b73] transition-colors inline-flex items-center gap-1 group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Login
            </Link>
          </div>

          <div className="mt-8 text-center text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            RUTAN Kelas IIB Enrekang
          </div>
        </div>
      </div>
    </main>
  )
}