'use client'

import { useActionState } from "react"
import { updateDisplaySettings } from "@/actions/display"
import Link from "next/link"
import { Eye, Save } from "lucide-react"

type Settings = Awaited<ReturnType<typeof import("@/actions/display").getDisplaySettings>>

export default function DisplaySettingsForm({ settings }: { settings: Settings }) {
    // Gunakan useActionState untuk menangani state form dan loading (pending)
    const [state, formAction, pending] = useActionState(updateDisplaySettings, null)

    if (!settings) return <div>Loading...</div>

    return (
        <form action={formAction} className="space-y-6" key={JSON.stringify(settings)}>
            {/* SUCCESS/ERROR TOAST */}
            {state?.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-slide-up">
                    {state.success}
                </div>
            )}
            {state?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slide-up">
                    {state.error}
                </div>
            )}

            {/* AKSES KONTROL */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Kontrol Akses</h2>
                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isPublic"
                            // Menggunakan defaultChecked agar sinkron dengan server setelah revalidate
                            defaultChecked={settings.isPublic}
                            className="w-5 h-5 text-[#5E2390] rounded focus:ring-[#5E2390]"
                        />
                        <div>
                            <span className="font-semibold text-slate-900">Akses Publik</span>
                            <p className="text-sm text-slate-600">Display dapat diakses tanpa login</p>
                        </div>
                    </label>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Interval Refresh (detik)
                        </label>
                        <input
                            type="number"
                            name="refreshInterval"
                            defaultValue={settings.refreshInterval}
                            min="10"
                            max="300"
                            className="w-full px-4 py-2 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5E2390] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Filter Hari Ke Depan
                        </label>
                        <input
                            type="number"
                            name="filterHariKedepan"
                            defaultValue={settings.filterHariKedepan}
                            min="7"
                            max="90"
                            className="w-full px-4 py-2 border text-black border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5E2390] focus:border-transparent"
                        />
                        <p className="text-xs text-slate-500 mt-1">Tampilkan data X hari ke depan</p>
                    </div>
                </div>
            </div>

            {/* KONTEN YANG DITAMPILKAN */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Konten Display</h2>
                <div className="grid grid-cols-2 gap-4">
                    {/* Hidden field untuk showAgenda tetap dipertahankan sesuai permintaan Anda */}
                    <input type="hidden" name="showAgenda" value="false" />
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="showKenaikanGaji"
                            defaultChecked={settings.showKenaikanGaji}
                            className="w-4 h-4 text-[#5E2390] rounded focus:ring-[#5E2390]"
                        />
                        <span className="text-sm font-medium text-slate-700">Kenaikan Gaji</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="showKenaikanPangkat"
                            defaultChecked={settings.showKenaikanPangkat}
                            className="w-4 h-4 text-[#5E2390] rounded focus:ring-[#5E2390]"
                        />
                        <span className="text-sm font-medium text-slate-700">Kenaikan Pangkat</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="showPembebasan"
                            defaultChecked={settings.showPembebasan}
                            className="w-4 h-4 text-[#5E2390] rounded focus:ring-[#5E2390]"
                        />
                        <span className="text-sm font-medium text-slate-700">Jadwal Bebas WBP</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="showMapenaling"
                            defaultChecked={settings.showMapenaling}
                            className="w-4 h-4 text-[#5E2390] rounded focus:ring-[#5E2390]"
                        />
                        <span className="text-sm font-medium text-slate-700">WBP Mapenaling</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="showPengumuman"
                            defaultChecked={settings.showPengumuman}
                            className="w-4 h-4 text-[#5E2390] rounded focus:ring-[#5E2390]"
                        />
                        <span className="text-sm font-medium text-slate-700">Pengumuman</span>
                    </label>
                </div>
            </div>

            {/* LAYOUT & CUSTOMIZATION */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Layout & Tampilan</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Mode Layout
                        </label>
                        <select
                            name="layoutMode"
                            defaultValue={settings.layoutMode}
                            className="w-full px-4 py-2 border text-black border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5E2390] focus:border-transparent"
                        >
                            <option value="GRID">Grid</option>
                            <option value="CAROUSEL">Carousel</option>
                            <option value="LIST">Mode Ticker (Teks Berjalan Horizontal)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            Pilih bagaimana data ditampilkan di layar TV.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Item Per Halaman
                        </label>
                        <input
                            type="number"
                            name="itemsPerPage"
                            defaultValue={settings.itemsPerPage}
                            min="5"
                            max="20"
                            className="w-full px-4 py-2 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5E2390] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Judul Display
                        </label>
                        <input
                            type="text"
                            name="displayTitle"
                            defaultValue={settings.displayTitle}
                            className="w-full px-4 py-2 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5E2390] focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Warna tetap dikirim via hidden input sesuai kode asli Anda */}
            <input type="hidden" name="primaryColor" value={settings.primaryColor} />
            <input type="hidden" name="backgroundColor" value={settings.backgroundColor} />

            {/* ACTIONS */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-[#5E2390] to-[#7C22CE] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                    <Save size={20} />
                    {pending ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>

                <Link
                    href="/display"
                    target="_blank"
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all"
                >
                    <Eye size={20} />
                    Preview Display
                </Link>
            </div>
        </form>
    )
}