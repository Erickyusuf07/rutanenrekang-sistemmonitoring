"use client"

import { WargaBinaan } from "@prisma/client"
import { X, User, Calendar, MapPin, Scale, FileText } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface WBPDetailModalProps {
  wbp: WargaBinaan
  isOpen: boolean
  onClose: () => void
}

export default function WBPDetailModal({ wbp, onClose }: WBPDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#5E2390] to-purple-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{wbp.nama}</h2>
              <p className="text-sm text-purple-100">{wbp.noRegistrasi}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/20"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          
          {/* SECTION 1: IDENTITAS */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#5E2390]">
              <User size={16} />
              Data Identitas
            </h3>
            <div className="grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-500">NIK</p>
                <p className="text-sm font-bold text-slate-800">{wbp.nik}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Jenis Kelamin</p>
                <p className="text-sm font-bold text-slate-800">
                  {wbp.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Tempat, Tanggal Lahir</p>
                <p className="text-sm font-bold text-slate-800">
                  {wbp.tempatLahir}, {format(wbp.tanggalLahir, "dd MMMM yyyy", { locale: id })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Agama</p>
                <p className="text-sm font-bold text-slate-800">{wbp.agama}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Pendidikan</p>
                <p className="text-sm font-bold text-slate-800">{wbp.pendidikan || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Pekerjaan</p>
                <p className="text-sm font-bold text-slate-800">{wbp.pekerjaan || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-slate-500">Alamat</p>
                <p className="text-sm font-bold text-slate-800">{wbp.alamat}</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: KONTAK KELUARGA */}
          {(wbp.namaKeluarga || wbp.noTeleponKeluarga) && (
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-700">
                <MapPin size={16} />
                Kontak Keluarga
              </h3>
              <div className="grid gap-4 rounded-lg bg-blue-50 p-4 md:grid-cols-2">
                {wbp.namaKeluarga && (
                  <div>
                    <p className="text-xs font-semibold text-blue-600">Nama Keluarga</p>
                    <p className="text-sm font-bold text-blue-900">{wbp.namaKeluarga}</p>
                  </div>
                )}
                {wbp.noTeleponKeluarga && (
                  <div>
                    <p className="text-xs font-semibold text-blue-600">No. Telepon</p>
                    <p className="text-sm font-bold text-blue-900">{wbp.noTeleponKeluarga}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: PERKARA */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-700">
              <Scale size={16} />
              Data Perkara & Hukuman
            </h3>
            <div className="space-y-4 rounded-lg bg-red-50 p-4">
              <div>
                <p className="text-xs font-semibold text-red-600">Perkara / Pasal</p>
                <p className="text-sm font-bold text-red-900">{wbp.perkara}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-red-600">Jenis Pidana</p>
                  <p className="text-sm font-bold text-red-900">
                    {wbp.jenisPidana === "TAHANAN" ? "Tahanan" : "Pidana"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-600">Vonis Hukuman</p>
                  <p className="text-sm font-bold text-red-900">
                    {wbp.vonisHukuman > 0 ? `${wbp.vonisHukuman} Bulan` : "Belum Ada Vonis"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-600">Tanggal Vonis</p>
                  <p className="text-sm font-bold text-red-900">
                    {/* ✅ FIX LINE 149 */}
                    {wbp.tanggalVonis ? format(wbp.tanggalVonis, "dd MMMM yyyy", { locale: id }) : "Belum Ada Vonis"}
                  </p>
                </div>
              </div>
              {wbp.namaPengacara && (
                <div>
                  <p className="text-xs font-semibold text-red-600">Nama Pengacara</p>
                  <p className="text-sm font-bold text-red-900">{wbp.namaPengacara}</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: MASA TAHANAN */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-700">
              <Calendar size={16} />
              Masa Tahanan
            </h3>
            <div className="grid gap-4 rounded-lg bg-orange-50 p-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-orange-600">Tanggal Masuk</p>
                <p className="text-sm font-bold text-orange-900">
                  {format(wbp.tanggalMasuk, "dd MMMM yyyy", { locale: id })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-orange-600">Selesai Mapenaling</p>
                <p className="text-sm font-bold text-orange-900">
                  {format(wbp.jadwalSelesaiMapenaling, "dd MMMM yyyy", { locale: id })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-orange-600">Tanggal Bebas</p>
                <p className="text-sm font-bold text-orange-900">
                  {/* ✅ FIX LINE 175 */}
                  {wbp.tanggalBebas ? format(wbp.tanggalBebas, "dd MMMM yyyy", { locale: id }) : "Belum Ada Vonis"}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 5: STATUS */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-700">
              <FileText size={16} />
              Status & Catatan
            </h3>
            <div className="space-y-4 rounded-lg bg-purple-50 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-purple-600">Status Penahanan</p>
                  <p className="text-sm font-bold text-purple-900">{wbp.statusPenahanan}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-600">Status WBP</p>
                  <p className="text-sm font-bold text-purple-900">{wbp.status}</p>
                </div>
              </div>
              {wbp.catatanKhusus && (
                <div>
                  <p className="text-xs font-semibold text-purple-600">Catatan Khusus</p>
                  <p className="text-sm font-bold text-purple-900">{wbp.catatanKhusus}</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[#5E2390] py-3 font-bold text-white transition-colors hover:bg-purple-800"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  )
}