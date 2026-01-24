'use client'

import { useState } from "react"
import { resetPasswordAction } from "@/actions/reset-password-actions"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:from-emerald-700 hover:to-emerald-600 hover:shadow-emerald-900/50 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            MEMPROSES...
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            RESET PASSWORD
          </>
        )}
      </span>
    </button>
  )
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ✅ VALIDASI TOKEN - derive error directly during render
  const tokenError = !token ? "Token tidak ditemukan. Silakan request ulang dari halaman lupa password." : ""

  async function handleSubmit(formData: FormData) {
    setError("")

    if (!token) {
      setError("Token tidak valid")
      return
    }

    // Tambahkan token ke formData
    formData.append("token", token)

    const result = await resetPasswordAction(formData)
    
    if (result?.error) {
      setError(result.error)
    }
    // Jika success, akan auto redirect ke login
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2E1065] via-[#4C1D95] to-[#0F172A] p-4">
      
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl transition-all duration-300 md:max-w-md">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 shadow-inner backdrop-blur-md">
            <Lock className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-wide text-white">
            RESET PASSWORD
          </h1>
          <p className="mt-2 text-sm text-emerald-100">
            Buat password baru untuk akun Anda
          </p>

          <div className="absolute -bottom-1 left-0 right-0 h-6 bg-white/95" style={{ clipPath: "polygon(0 100%, 100% 100%, 50% 0)" }}></div>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-10 pt-6">
          
          {/* Error Message */}
          {(error || tokenError) && (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              ⚠️ {error || tokenError}
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
              
              {/* Password Baru */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password Baru
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Harus ada huruf besar, kecil, angka, dan simbol
                </p>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Konfirmasi Password
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                    placeholder="Ketik ulang password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <SubmitButton />
            </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="text-sm font-semibold text-[#5E2390] hover:text-[#4a1b73] transition-colors"
            >
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