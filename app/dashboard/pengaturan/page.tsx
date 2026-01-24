'use client'

import { updateConfig } from "@/actions/settings"
import { Settings, Save, Loader2, CheckCircle2 } from "lucide-react"
import { useActionState, useEffect, useState } from "react"

interface ConfigData {
    tahunKenaikanPangkat: number;
    tahunKenaikanGaji: number;
}

export default function SettingsForm({ initialData }: { initialData: ConfigData | null }) {
    // Menggunakan useActionState untuk menangkap feedback dari Server Action
    const [state, formAction, isPending] = useActionState(updateConfig, null)
    
    // Perbaikan: Hanya gunakan satu state untuk kontrol visibilitas notifikasi
    const [showNotification, setShowNotification] = useState(false)

    // Efek untuk memicu notifikasi sukses
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (state?.success) {
            // Perbaikan ESLint: Menggunakan timeout kecil untuk menghindari 'cascading renders'
            // dan memastikan state diupdate setelah fase commit selesai
            timer = setTimeout(() => {
                setShowNotification(true)
            }, 10)

            // Sembunyikan notifikasi setelah 3 detik
            const hideTimer = setTimeout(() => {
                setShowNotification(false)
            }, 3000)

            return () => {
                clearTimeout(timer)
                clearTimeout(hideTimer)
            }
        }
    }, [state])

    return (
        <div className="max-w-2xl mx-auto space-y-8 p-6">
            {/* Header: Diberi border bottom dan padding bawah agar tidak rapat */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="flex h-12 w-12 items-center justify-center bg-purple-50 rounded-2xl text-[#5E2390] shadow-sm">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan Sistem</h1>
                    <p className="text-sm font-medium text-slate-500">Konfigurasi otomatisasi jadwal kenaikan berkala pegawai</p>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-purple-900/5 transition-all">
                <form action={formAction} className="space-y-10">

                    {/* Notifikasi Sukses: Muncul dengan animasi transisi */}
                    {showNotification && state?.success && (
                        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-black border border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-500">
                            <CheckCircle2 size={20} className="text-emerald-500" /> 
                            {state.success}
                        </div>
                    )}

                    {/* Grid Input: Jarak antar item diperlebar agar tidak bertubrukan */}
                    <div className="grid gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                                Interval Kenaikan Pangkat (Tahun)
                            </label>
                            <input
                                name="tahunKenaikanPangkat"
                                type="number"
                                defaultValue={initialData?.tahunKenaikanPangkat || 4}
                                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-lg font-bold text-slate-800 transition-all focus:border-[#5E2390] focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-50 placeholder:text-slate-300"
                                placeholder="Contoh: 4"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                                Interval Gaji Berkala (Tahun)
                            </label>
                            <input
                                name="tahunKenaikanGaji"
                                type="number"
                                defaultValue={initialData?.tahunKenaikanGaji || 2}
                                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-lg font-bold text-slate-800 transition-all focus:border-[#5E2390] focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-50 placeholder:text-slate-300"
                                placeholder="Contoh: 2"
                            />
                        </div>
                    </div>

                    {/* Tombol Simpan: Desain lebih modern dengan efek hover & active */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-[#5E2390] py-4 text-base font-black text-white shadow-xl shadow-purple-900/20 transition-all hover:bg-purple-800 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <Loader2 size={22} className="animate-spin" />
                            ) : (
                                <Save size={22} className="transition-transform group-hover:rotate-12" />
                            )}
                            {isPending ? "MEMPROSES DATA..." : "SIMPAN KONFIGURASI"}
                        </button>
                    </div>
                </form>
            </div>
            
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Rutan Kelas IIB Enrekang • Sistem Monitoring Terintegrasi
            </p>
        </div>
    )
}