"use client"

import Link from "next/link"
import { useState } from "react"
import { Plus, User, Fingerprint, CalendarDays, Pencil, Users, Clock, CalendarCheck, UserCheck, Eye, ShieldAlert, Activity } from "lucide-react"
import DeleteWBPButton from "./delete-button"
import { StatusBadge } from "@/components/ui/status-badge"
import { WBPSearchFilter } from "./search-filter"
import WBPDetailModal from "@/components/ui/wbp-detail-modal"
import type { WargaBinaan } from "@prisma/client"
import { ExportImportButton } from "./export-import-button" 
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric", month: "short", year: "numeric"
    }).format(date)
}

interface WBPPageClientProps {
    wbpList: WargaBinaan[]
    stats: {
        total: number
        mapenaling: number
        bebasBulanIni: number
        normal: number
        isolasi: number  // ✅ TAMBAH
        karantina: number
    }
}

export function WBPPageClient({ wbpList, stats }: WBPPageClientProps) {
    const [selectedWBP, setSelectedWBP] = useState<WargaBinaan | null>(null)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Data Warga Binaan</h1>
                    <p className="text-sm text-slate-500">Monitoring masa pidana & mapenaling</p>
                </div>
                
                {/* ✅ Tombol di kanan, sejajar */}
                <div className="flex flex-wrap gap-2">
                    <ExportImportButton />
                    <Link
                        href="/dashboard/wbp/create"
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#5E2390] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-purple-200"
                    >
                        <Plus size={18} />
                        Registrasi WBP
                    </Link>
                </div>
            </div>

            {/* ✅ STATISTICS CARDS - TAMBAH ISOLASI */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {/* Card 1: Total WBP */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total WBP</p>
                            <p className="mt-2 text-3xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                        <div className="rounded-full bg-blue-50 p-3">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Card 2: Dalam Mapenaling */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Mapenaling</p>
                            <p className="mt-2 text-3xl font-bold text-orange-600">{stats.mapenaling}</p>
                        </div>
                        <div className="rounded-full bg-orange-50 p-3">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Card 3: Status Normal */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Normal</p>
                            <p className="mt-2 text-3xl font-bold text-purple-600">{stats.normal}</p>
                        </div>
                        <div className="rounded-full bg-purple-50 p-3">
                            <UserCheck className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* ✅ Card 4: Isolasi (BARU) */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Isolasi</p>
                            <p className="mt-2 text-3xl font-bold text-red-600">{stats.isolasi}</p>
                        </div>
                        <div className="rounded-full bg-red-50 p-3">
                            <ShieldAlert className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Karantina</p>
                            <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.karantina}</p>
                        </div>
                        <div className="rounded-full bg-yellow-50 p-3">
                            <Activity className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                {/* Card 5: Bebas Bulan Ini */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Bebas Bulan Ini</p>
                            <p className="mt-2 text-3xl font-bold text-green-600">{stats.bebasBulanIni}</p>
                        </div>
                        <div className="rounded-full bg-green-50 p-3">
                            <CalendarCheck className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <WBPSearchFilter />

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Identitas WBP</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Perkara</th>
                                <th className="px-6 py-4 font-semibold">Mapenaling</th>
                                <th className="px-6 py-4 font-semibold">Bebas</th>
                                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {wbpList.map((wbp) => (
                                <tr key={wbp.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{wbp.nama}</div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Fingerprint size={12} />
                                                    {wbp.noRegistrasi}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={wbp.statusPenahanan} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                            {wbp.perkara}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-700 text-xs">
                                            {formatDate(wbp.jadwalSelesaiMapenaling)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {wbp.tanggalBebas ? (
                                            <div className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                                                <CalendarDays size={14} />
                                                {formatDate(wbp.tanggalBebas)}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-yellow-600 font-semibold bg-yellow-50 px-2 py-1 rounded">
                                                Belum Ada Vonis
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedWBP(wbp)}
                                                className="rounded-lg p-2 text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <Link
                                                href={`/dashboard/wbp/${wbp.id}/edit`}
                                                className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                title="Edit Data"
                                            >
                                                <Pencil size={18} />
                                            </Link>
                                            <DeleteWBPButton id={wbp.id} nama={wbp.nama} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {wbpList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Tidak ada data warga binaan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DETAIL */}
            {selectedWBP && (
                <WBPDetailModal
                    wbp={selectedWBP}
                    isOpen={!!selectedWBP}
                    onClose={() => setSelectedWBP(null)}
                />
            )}
        </div>
    )
}