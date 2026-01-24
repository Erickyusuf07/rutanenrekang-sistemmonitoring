'use client'

import { useState } from "react"
import { loginAction } from "@/actions/auth"
import Link from "next/link" // ✅ TAMBAH INI
import { User, Lock, Loader2, MapPin } from "lucide-react"
import Image from "next/image"
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setErrorMessage(null)

    const result = await loginAction(formData)
    
    if (result?.error) {
      setErrorMessage(result.error)
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      
      <div className="absolute inset-0 opacity-[0.15] invert bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl transition-all duration-300 md:max-w-md">
        
        {/* Header Section */}
        <div className="relative bg-[#5E2390] px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 shadow-inner backdrop-blur-md">
            <Image
              src="/logo.png"
              alt="Logo Rutan Enrekang"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <h1 className="text-2xl font-bold tracking-wide text-white font-heading">
            SISTEM MONITORING
          </h1>
          <p className="mt-1 text-xs font-semibold text-purple-100 uppercase tracking-wider">
            Kementerian Imigrasi Dan Pemasyarakatan
          </p>
          <div className="mt-1 flex items-center justify-center gap-1 text-xs text-purple-200 opacity-90">
             <MapPin className="h-3 w-3" />
             <span>RUTAN KELAS IIB ENREKANG</span>
          </div>

          <div className="absolute -bottom-1 left-0 right-0 h-6 bg-white/95" style={{ clipPath: "polygon(0 100%, 100% 100%, 50% 0)" }}></div>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-10 pt-6">
          
          {errorMessage && (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600 border border-red-200 flex items-center justify-center gap-2">
               ⚠️ {errorMessage}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            
            {/* Input Username */}
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#5E2390] transition-colors" />
              </div>
              <input
                name="identifier"
                type="text"
                required
                disabled={isLoading}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-[#5E2390] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E2390]/20"
                placeholder="Username atau Email"
              />
            </div>

            {/* Input Password */}
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#5E2390] transition-colors" />
              </div>
              <input
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-[#5E2390] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E2390]/20"
                placeholder="Kata Sandi"
              />
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-[#5E2390] py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/30 transition-all hover:bg-[#4a1b73] hover:shadow-purple-900/50 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    MEMERIKSA DATA...
                  </>
                ) : (
                  <>
                    MASUK SISTEM
                  </>
                )}
              </span>
            </button>
          </form>

          {/* ✅ TAMBAH LINK LUPA PASSWORD (DESAIN KONSISTEN!) */}
          <div className="mt-6 text-center">
            <Link 
              href="/forgot-password"
              className="text-sm font-semibold text-[#5E2390] hover:text-[#4a1b73] transition-colors inline-flex items-center gap-1 group"
            >
              <Lock className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              Lupa Password?
            </Link>
          </div>

          {/* Footer Copyright */}
          <div className="mt-8 text-center text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            Integritas • Profesional • Akuntabel
          </div>
        </div>
      </div>
    </main>
  )
}