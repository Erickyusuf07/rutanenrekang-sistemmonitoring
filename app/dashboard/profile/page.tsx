// app/dashboard/profile/page.tsx
'use client'

import { useActionState, useEffect } from "react"
import { requestUpdateProfile, verifyEmailChangeOTP } from "@/actions/profile"
import { useSession } from "next-auth/react"
import { UserCircle, Mail, Lock, CheckCircle2, Loader2, Key } from "lucide-react"

export default function ProfilePage() {
    const { data: session, update } = useSession()


    // State untuk form utama
    const [updateState, formAction, isPending] = useActionState(requestUpdateProfile, null)
    // State untuk form OTP
    const [otpState, otpAction, isOtpPending] = useActionState(verifyEmailChangeOTP, null)

    const showOTP = updateState?.requireOTP && !otpState?.success;
    useEffect(() => {
        if (otpState?.success || (updateState?.success && !updateState?.requireOTP)) {
            update({
                user: {
                    name: updateState?.success ? (document.querySelector('input[name="namaLengkap"]') as HTMLInputElement)?.value : session?.user?.name,
                    email: otpState?.success ? (document.querySelector('input[name="email"]') as HTMLInputElement)?.value : session?.user?.email,
                    username: updateState?.success ? (document.querySelector('input[name="username"]') as HTMLInputElement)?.value : (session?.user as { username?: string })?.username,
                }
            });
        }
    }, [otpState?.success, updateState?.success, updateState?.requireOTP, update, session]);
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pt-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Edit Profil</h1>
                <p className="text-slate-500 mt-1">Perbarui informasi akun dan keamanan Anda.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-100">

                {/* ================= FORM OTP (MUNCUL JIKA GANTI EMAIL) ================= */}
                {showOTP ? (
                    <form action={otpAction} className="space-y-6" autoComplete="off">
                        <div className="text-center">
                            <div className="mx-auto bg-blue-50 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Verifikasi Email Baru</h3>
                            <p className="text-slate-500 mt-2">Kami telah mengirim 6 digit kode OTP ke email baru Anda.</p>
                        </div>

                        {otpState?.error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg">{otpState.error}</p>}

                        <div>
                            <label className="text-sm font-semibold text-slate-700">Kode OTP</label>
                            <input
                                name="otp"
                                type="text"
                                maxLength={6}
                                required
                                className="w-full mt-2 text-center text-3xl tracking-[0.5em] font-bold p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="------"
                            />
                        </div>

                        <div className="flex gap-4">
                            <a href="/dashboard/profile" className="flex-1 py-3 text-center bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">
                                Batal
                            </a>
                            <button type="submit" disabled={isOtpPending} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 flex justify-center items-center">
                                {isOtpPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verifikasi OTP"}
                            </button>
                        </div>
                    </form>
                ) : (

                    /* ================= FORM UTAMA ================= */
                    <form action={formAction} className="space-y-6">

                        {updateState?.error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">{updateState.error}</p>}
                        {updateState?.success && !updateState.requireOTP && (
                            <p className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> {updateState.message}
                            </p>
                        )}
                        {otpState?.success && (
                            <p className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> {otpState.message}
                            </p>
                        )}
                        {/* Nama Lengkap */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><UserCircle className="w-4 h-4" /> Nama Lengkap</label>
                            <input
                                name="namaLengkap"
                                type="text"
                                defaultValue={(session?.user as { namaLengkap?: string })?.namaLengkap || session?.user?.name || ""}
                                required
                                className="w-full mt-2 p-3 bg-slate-50  text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        {/* Username */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><UserCircle className="w-4 h-4" /> Username</label>
                            <input
                                name="username"
                                type="text"
                                autoComplete="none" // ✅ BLOKIR AUTOFILL CHROME
                                defaultValue={(session?.user as { username?: string })?.username || ""}
                                required
                                className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-black outline-none"
                            />
                        </div>
                        {/* Email */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Mail className="w-4 h-4" /> Alamat Email</label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={session?.user?.email || ""}
                                required
                                className="w-full mt-2 p-3 bg-slate-50 border text-black border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-400 mt-2">*Jika mengubah email, Anda perlu melakukan verifikasi OTP.</p>
                        </div>

                        {/* Password Baru */}
                        <div className="pt-4 border-t border-slate-100">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Lock className="w-4 h-4" /> Password Baru (Opsional)</label>
                            <input
                                name="passwordBaru"
                                type="password"
                                autoComplete="new-password" // ✅ BLOKIR AUTOFILL CHROME
                                className="w-full mt-2 p-3 bg-slate-50 border text-black border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Isi jika ingin mengubah password"
                            />
                        </div>

                        {/* Tombol Simpan & Link Lupa Password */}
                        <div className="flex flex-col gap-4 mt-8">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 flex justify-center items-center"
                            >
                                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Perubahan"}
                            </button>

                            <a
                                href="https://rutanenrekang-sistemmonitoring.vercel.app/forgot-password"
                                target="_blank"
                                className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                <Key className="w-4 h-4" /> Lupa Password Saat Ini? (Reset via Email)
                            </a>
                        </div>
                    </form>
                )}

            </div>
        </div>
    )
}