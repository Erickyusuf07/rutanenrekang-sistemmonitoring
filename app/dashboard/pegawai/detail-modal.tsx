// app/dashboard/pegawai/detail-modal.tsx
'use client'

import { useState } from "react"
import { Eye, X, User, Briefcase, Calendar, MapPin, Phone, GraduationCap } from "lucide-react"
import { createPortal } from "react-dom"
// Definisi Tipe Data (Sesuaikan dengan data yang ada)
interface PegawaiDetail {
  id: string
  nama: string
  nip: string
  jabatan: string
  golonganId: string  // ✅ Tambah golonganId
  golongan: {         // ✅ Ubah jadi object
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
  tmtPangkatTerakhir: Date
  jadwalNaikPangkat: Date
  tmtGajiTerakhir: Date
  jadwalKenaikanGaji: Date
  status: string
}

// Helper Format Tanggal
const formatDate = (date?: Date | null) => {
  if (!date) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  }).format(new Date(date))
}

export default function DetailModal({ pegawai }: { pegawai: PegawaiDetail }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* TOMBOL TRIGGER (MATA) */}
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-2 text-slate-400 transition-all hover:bg-yellow-100 hover:text-yellow-700 "
        title="Lihat Detail Lengkap"
      >
        <Eye size={18} />
      </button>

      {/* MODAL OVERLAY */}
      {isOpen && createPortal(
         <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

          {/* MODAL CONTENT */}
          <div 
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border-2 border-black "
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b-2 border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-black uppercase tracking-wide">Detail Pegawai</h2>
                  <p className="text-xs font-bold text-slate-500">NIP. {pegawai.nip}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* BODY (SCROLLABLE) */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-8">

              {/* 1. INFORMASI PRIBADI */}
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase text-slate-400">
                  <User size={16} /> Informasi Pribadi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <Item label="Nama Lengkap" value={pegawai.nama} isBold />
                  <Item label="Jenis Kelamin" value={pegawai.jenisKelamin === 'LAKI_LAKI' ? 'Laki-Laki' : 'Perempuan'} />
                  <Item label="Tempat, Tgl Lahir" value={`${pegawai.tempatLahir || '-'}, ${formatDate(pegawai.tanggalLahir)}`} />
                  <Item label="Pendidikan" value={pegawai.pendidikanTerakhir} icon={<GraduationCap size={14} />} />
                  <Item label="No. Telepon" value={pegawai.noTelepon} icon={<Phone size={14} />} />
                  <div className="md:col-span-2">
                    <Item label="Alamat Domisili" value={pegawai.alamat} icon={<MapPin size={14} />} />
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-100 my-2"></div>

              {/* 2. JABATAN & PANGKAT */}
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase text-slate-400">
                  <Briefcase size={16} /> Jabatan & Karir
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <Item label="Jabatan Saat Ini" value={pegawai.jabatan} isBold />
                  <Item
                    label="Pangkat / Golongan"
                    value={`${pegawai.golongan.kode} - ${pegawai.golongan.nama}`}
                    highlight
                  />
                  <Item label="Tanggal Masuk (TMT)" value={formatDate(pegawai.tanggalMasuk)} />
                  <Item label="Status Kepegawaian" value={pegawai.status} />
                </div>
              </section>

              <div className="border-t border-slate-100 my-2"></div>

              {/* 3. JADWAL KENAIKAN (Box Style) */}
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase text-slate-400">
                  <Calendar size={16} /> Jadwal Kenaikan (TMT)
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Card Kiri */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold text-slate-500 mb-1">Kenaikan Pangkat</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-400">TMT Terakhir</p>
                        <p className="font-semibold text-slate-700">{formatDate(pegawai.tmtPangkatTerakhir)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">Jadwal Berikutnya</p>
                        <p className="font-bold text-orange-600">{formatDate(pegawai.jadwalNaikPangkat)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Kanan */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold text-slate-500 mb-1">Kenaikan Gaji Berkala</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-400">TMT Terakhir</p>
                        <p className="font-semibold text-slate-700">{formatDate(pegawai.tmtGajiTerakhir)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">Jadwal Berikutnya</p>
                        <p className="font-bold text-green-600">{formatDate(pegawai.jadwalKenaikanGaji)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* FOOTER */}
            <div className="bg-slate-50 px-6 py-4 border-t-2 border-slate-100 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all"
              >
                Tutup Detail
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// Komponen Kecil untuk Baris Data
function Item({ label, value, icon, isBold, highlight }: { label: string, value?: string | null, icon?: React.ReactNode, isBold?: boolean, highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
        {icon} {label}
      </span>
      <span className={`text-sm ${isBold ? 'font-black text-black text-base' : 'font-medium text-slate-800'} ${highlight ? 'bg-yellow-100 px-2 py-0.5 rounded w-fit text-yellow-800 font-bold' : ''}`}>
        {value || "-"}
      </span>
    </div>
  )
}