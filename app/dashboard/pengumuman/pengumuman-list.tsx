'use client'

import { useState } from "react"
import Link from "next/link"
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Edit,
  Eye,
  Shield,
  Scale
} from "lucide-react"
import DetailModal from "@/app/dashboard/pegawai/detail-modal" // ✅ IMPORT MODAL PEGAWAI
import WBPDetailModal from "@/components/ui/wbp-detail-modal" // ✅ IMPORT MODAL WBP
import { WargaBinaan } from "@prisma/client" // ✅ IMPORT TYPE

// ✅ TYPES - LENGKAP UNTUK MODAL
interface PegawaiData {
  id: string
  nama: string
  nip: string
  jabatan: string
  golonganId: string
  golongan: {
    id: string
    kode: string
    nama: string
  }
  jenisKelamin: string
  tempatLahir?: string | null
  tanggalLahir?: Date | null
  noTelepon?: string | null
  alamat?: string | null
  pendidikanTerakhir?: string | null
  tanggalMasuk?: Date | null
  jadwalNaikPangkat: Date
  jadwalKenaikanGaji: Date
  tmtPangkatTerakhir: Date
  tmtGajiTerakhir: Date
  status: string
}

// ✅ TYPE WBP (sama dengan WargaBinaan dari Prisma)
type WBPData = WargaBinaan

interface StatsPegawai {
  total: number
  urgent: number
  jatuhTempo: number
  segera: number
}

interface StatsWBP {
  total: number
  urgent: number
  segera: number
  normal: number
}

type MainTab = 'pegawai' | 'wbp'
type FilterTypePegawai = 'semua' | 'pangkat' | 'gaji' | 'urgent'
type FilterTypeWBP = 'semua' | 'urgent' | 'segera'

// ✅ HELPER FORMAT TANGGAL
const formatDateID = (date: Date | null | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

// ✅ HELPER STATUS PEGAWAI
const getScheduleStatus = (jadwal: Date, today: Date) => {
  const diffDays = Math.floor((new Date(jadwal).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < -90) {
    return { 
      status: 'urgent', 
      text: 'TERLAMBAT', 
      icon: XCircle, 
      color: 'bg-red-100 text-red-700 border-red-300',
    }
  }
  if (diffDays < 0) {
    return { 
      status: 'warning', 
      text: 'JATUH TEMPO', 
      icon: AlertTriangle, 
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    }
  }
  if (diffDays < 30) {
    return { 
      status: 'soon', 
      text: 'SEGERA', 
      icon: Clock, 
      color: 'bg-orange-100 text-orange-700 border-orange-300',
    }
  }
  return { 
    status: 'ok', 
    text: 'AKTIF', 
    icon: CheckCircle2, 
    color: 'bg-green-100 text-green-700 border-green-300',
  }
}

// ✅ HELPER STATUS WBP
const getWBPStatus = (tanggalBebas: Date | null, today: Date) => {
  if (!tanggalBebas) {
    return { 
      status: 'normal', 
      text: 'BELUM ADA VONIS', 
      icon: Clock, 
      color: 'bg-slate-100 text-slate-700 border-slate-300',
    }
  }

  const diffDays = Math.floor((new Date(tanggalBebas).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return { 
      status: 'urgent', 
      text: 'SEHARUSNYA BEBAS', 
      icon: XCircle, 
      color: 'bg-red-100 text-red-700 border-red-300',
    }
  }
  if (diffDays < 7) {
    return { 
      status: 'urgent', 
      text: 'BEBAS MINGGU INI', 
      icon: AlertTriangle, 
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    }
  }
  if (diffDays < 30) {
    return { 
      status: 'segera', 
      text: 'BEBAS BULAN INI', 
      icon: Clock, 
      color: 'bg-orange-100 text-orange-700 border-orange-300',
    }
  }
  return { 
    status: 'normal', 
    text: 'AKTIF', 
    icon: CheckCircle2, 
    color: 'bg-green-100 text-green-700 border-green-300',
  }
}

// ✅ MAIN COMPONENT
export default function PengumumanList({ 
  pegawaiList, 
  statsPegawai,
  wbpList,
  statsWBP
}: { 
  pegawaiList: PegawaiData[]
  statsPegawai: StatsPegawai
  wbpList: WBPData[]
  statsWBP: StatsWBP
}) {
  // ✅ STATE MANAGEMENT
  const [mainTab, setMainTab] = useState<MainTab>('pegawai')
  const [filterPegawai, setFilterPegawai] = useState<FilterTypePegawai>('semua')
  const [filterWBP, setFilterWBP] = useState<FilterTypeWBP>('semua')
  
  // ✅ BARU: State untuk modal WBP
  const [selectedWBP, setSelectedWBP] = useState<WBPData | null>(null)
  const today = new Date()

  // ✅ FILTER PEGAWAI
  const filteredPegawai = pegawaiList.filter((p) => {
    const statusPangkat = getScheduleStatus(p.jadwalNaikPangkat, today)
    const statusGaji = getScheduleStatus(p.jadwalKenaikanGaji, today)

    if (filterPegawai === 'urgent') {
      return statusPangkat.status === 'urgent' || statusGaji.status === 'urgent'
    }
    if (filterPegawai === 'pangkat') {
      return statusPangkat.status !== 'ok'
    }
    if (filterPegawai === 'gaji') {
      return statusGaji.status !== 'ok'
    }
    return statusPangkat.status !== 'ok' || statusGaji.status !== 'ok'
  })

  // ✅ FILTER WBP
  const filteredWBP = wbpList.filter((w) => {
    const status = getWBPStatus(w.tanggalBebas, today)

    if (filterWBP === 'urgent') {
      return status.status === 'urgent'
    }
    if (filterWBP === 'segera') {
      return status.status === 'segera'
    }
    return true
  })

  return (
    <>
      <div className="space-y-6">
        {/* ✅ HEADER */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
          <h1 className="text-3xl font-bold text-slate-900">Pengumuman</h1>
          <p className="text-slate-600 mt-1">Monitor kenaikan pegawai dan jadwal bebas warga binaan</p>
        </div>

        {/* ✅ MAIN TAB SWITCHER */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-2 flex gap-2">
          <button
            onClick={() => setMainTab('pegawai')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              mainTab === 'pegawai'
                ? 'bg-linear-to-r from-[#5E2390] to-[#4C1D95] text-white shadow-lg'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Users size={20} />
            <span>Kenaikan Pegawai</span>
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
              mainTab === 'pegawai' 
                ? 'bg-white/20 text-white' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {statsPegawai.total}
            </span>
          </button>

          <button
            onClick={() => setMainTab('wbp')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              mainTab === 'wbp'
                ? 'bg-linear-to-r from-[#5E2390] to-[#4C1D95] text-white shadow-lg'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Shield size={20} />
            <span>Jadwal Bebas WBP</span>
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
              mainTab === 'wbp' 
                ? 'bg-white/20 text-white' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {statsWBP.total}
            </span>
          </button>
        </div>

        {/* ✅ CONTENT BERDASARKAN TAB AKTIF */}
        {mainTab === 'pegawai' ? (
          <>
            {/* STATS PEGAWAI */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard 
                label="Total Pegawai" 
                value={statsPegawai.total} 
                icon={<Users size={24} />}
                gradient="from-slate-100 to-slate-50"
                iconBg="bg-slate-200"
                iconColor="text-slate-600"
              />
              <StatCard 
                label="Terlambat" 
                value={statsPegawai.urgent} 
                icon={<XCircle size={24} />}
                gradient="from-red-100 to-pink-50"
                iconBg="bg-red-200"
                iconColor="text-red-600"
              />
              <StatCard 
                label="Jatuh Tempo" 
                value={statsPegawai.jatuhTempo} 
                icon={<AlertTriangle size={24} />}
                gradient="from-yellow-100 to-amber-50"
                iconBg="bg-yellow-200"
                iconColor="text-yellow-600"
              />
              <StatCard 
                label="Segera" 
                value={statsPegawai.segera} 
                icon={<Clock size={24} />}
                gradient="from-orange-100 to-yellow-50"
                iconBg="bg-orange-200"
                iconColor="text-orange-600"
              />
            </div>

            {/* FILTER TABS PEGAWAI */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-2 flex gap-2 overflow-x-auto">
              {[
                { id: 'semua', label: 'Semua', count: filteredPegawai.length },
                { id: 'urgent', label: 'Urgent', count: statsPegawai.urgent },
                { id: 'pangkat', label: 'Kenaikan Pangkat', count: 0 },
                { id: 'gaji', label: 'Kenaikan Gaji', count: 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterPegawai(tab.id as FilterTypePegawai)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    filterPegawai === tab.id
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-white/50'
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </div>

            {/* LIST PEGAWAI */}
            <div className="space-y-4">
              {filteredPegawai.length === 0 ? (
                <EmptyState 
                  icon={<CheckCircle2 size={48} />}
                  title="Semua Jadwal Aktif"
                  description="Tidak ada pegawai yang perlu perhatian khusus"
                />
              ) : (
                filteredPegawai.map((pegawai) => {
                  const statusPangkat = getScheduleStatus(pegawai.jadwalNaikPangkat, today)
                  const statusGaji = getScheduleStatus(pegawai.jadwalKenaikanGaji, today)

                  return (
                    <div key={pegawai.id} className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-slate-100 rounded-xl">
                              <Users size={20} className="text-slate-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">{pegawai.nama}</h3>
                              <p className="text-sm text-slate-500">NIP: {pegawai.nip} • {pegawai.jabatan}</p>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {/* Pangkat */}
                            {statusPangkat.status !== 'ok' && (
                              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <TrendingUp size={16} className="text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-700">Kenaikan Pangkat</p>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg mt-1 ${statusPangkat.color}`}>
                                      <statusPangkat.icon size={10} />
                                      {statusPangkat.text}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 flex items-center gap-1">
                                  <Calendar size={12} />
                                  {formatDateID(pegawai.jadwalNaikPangkat)}
                                </p>
                              </div>
                            )}

                            {/* Gaji */}
                            {statusGaji.status !== 'ok' && (
                              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign size={16} className="text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-700">Kenaikan Gaji</p>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg mt-1 ${statusGaji.color}`}>
                                      <statusGaji.icon size={10} />
                                      {statusGaji.text}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 flex items-center gap-1">
                                  <Calendar size={12} />
                                  {formatDateID(pegawai.jadwalKenaikanGaji)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ✅ ACTIONS - FIX: TAMBAH MODAL DETAIL */}
                        <div className="flex gap-2">
                          {/* ✅ TOMBOL DETAIL MODAL */}
                          <DetailModal pegawai={pegawai} />
                          
                          {/* TOMBOL EDIT */}
                          <Link
                            href={`/dashboard/pegawai/${pegawai.id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-all"
                          >
                            <Edit size={16} />
                            <span className="hidden sm:inline">Edit</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        ) : (
          <>
            {/* STATS WBP */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard 
                label="Total WBP" 
                value={statsWBP.total} 
                icon={<Shield size={24} />}
                gradient="from-slate-100 to-slate-50"
                iconBg="bg-slate-200"
                iconColor="text-slate-600"
              />
              <StatCard 
                label="Bebas Minggu Ini" 
                value={statsWBP.urgent} 
                icon={<AlertTriangle size={24} />}
                gradient="from-yellow-100 to-amber-50"
                iconBg="bg-yellow-200"
                iconColor="text-yellow-600"
              />
              <StatCard 
                label="Bebas Bulan Ini" 
                value={statsWBP.segera} 
                icon={<Clock size={24} />}
                gradient="from-orange-100 to-yellow-50"
                iconBg="bg-orange-200"
                iconColor="text-orange-600"
              />
              <StatCard 
                label="Aktif" 
                value={statsWBP.normal} 
                icon={<CheckCircle2 size={24} />}
                gradient="from-green-100 to-emerald-50"
                iconBg="bg-green-200"
                iconColor="text-green-600"
              />
            </div>

            {/* FILTER TABS WBP */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-2 flex gap-2">
              {[
                { id: 'semua', label: 'Semua', count: filteredWBP.length },
                { id: 'urgent', label: 'Minggu Ini', count: statsWBP.urgent },
                { id: 'segera', label: 'Bulan Ini', count: statsWBP.segera },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterWBP(tab.id as FilterTypeWBP)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterWBP === tab.id
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-white/50'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* LIST WBP */}
            <div className="space-y-4">
              {filteredWBP.length === 0 ? (
                <EmptyState 
                  icon={<CheckCircle2 size={48} />}
                  title="Tidak Ada Jadwal Bebas"
                  description="Belum ada WBP yang dijadwalkan bebas"
                />
              ) : (
                filteredWBP.map((wbp) => {
                  const status = getWBPStatus(wbp.tanggalBebas, today)

                  return (
                    <div key={wbp.id} className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-slate-100 rounded-xl">
                              <Shield size={20} className="text-slate-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">{wbp.nama}</h3>
                              <p className="text-sm text-slate-500">No. Reg: {wbp.noRegistrasi}</p>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Scale size={16} className="text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-700">Jadwal Bebas</p>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg mt-1 ${status.color}`}>
                                  <status.icon size={10} />
                                  {status.text}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2 text-xs text-slate-600">
                              <p className="flex items-center gap-2">
                                <Calendar size={12} />
                                <span className="font-semibold">Tanggal Bebas:</span>
                                {formatDateID(wbp.tanggalBebas)}
                              </p>
                              <p><span className="font-semibold">Jenis Pidana:</span> {wbp.jenisPidana}</p>
                              {wbp.vonisHukuman > 0 && (
                                <p><span className="font-semibold">Lama Hukuman:</span> {wbp.vonisHukuman} bulan</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ✅ FIX: GANTI LINK EDIT JADI TOMBOL MODAL DETAIL */}
                        <button
                          onClick={() => setSelectedWBP(wbp)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-all"
                        >
                          <Eye size={16} />
                          <span className="hidden sm:inline">Detail</span>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* ✅ BARU: MODAL WBP DETAIL */}
      {selectedWBP && (
        <WBPDetailModal 
          wbp={selectedWBP} 
          isOpen={!!selectedWBP}
          onClose={() => setSelectedWBP(null)} 
        />
      )}
    </>
  )
}

// ✅ STAT CARD COMPONENT
function StatCard({ 
  label, 
  value, 
  icon, 
  gradient, 
  iconBg, 
  iconColor 
}: { 
  label: string
  value: number
  icon: React.ReactNode
  gradient: string
  iconBg: string
  iconColor: string
}) {
  return (
    <div className={`backdrop-blur-xl bg-linear-to-br ${gradient} border border-white/20 rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  )
}

// ✅ EMPTY STATE COMPONENT
function EmptyState({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-12 text-center">
      <div className="text-green-500 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2">{description}</p>
    </div>
  )
}