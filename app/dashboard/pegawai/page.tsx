'use client'

import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "use-debounce"
import Link from "next/link"
import { Edit, Plus, Search, Loader2, TrendingUp, Calendar } from "lucide-react"
import DeleteButton from "./delete-button"
import DetailModal from "./detail-modal"
import ImportExportModal from "./import-export-modal"
import { JenisKelamin, StatusAktif } from "@prisma/client"
interface PegawaiWithGolongan {
  id: string
  nip: string
  nama: string
  jabatan: string
  golonganId: string
  golongan: {
    id: string
    kode: string
    nama: string
  }
  jadwalNaikPangkat: Date
  jadwalKenaikanGaji: Date
  jenisKelamin: JenisKelamin
  tempatLahir: string | null
  tanggalLahir: Date | null
  noTelepon: string | null
  alamat: string | null
  pendidikanTerakhir: string | null
  tanggalMasuk: Date | null
  tmtPangkatTerakhir: Date
  tmtGajiTerakhir: Date
  status: StatusAktif
  createdAt: Date
  updatedAt: Date
}
export default function PegawaiPage() {
  const [pegawaiList, setPegawaiList] = useState<PegawaiWithGolongan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch] = useDebounce(searchTerm, 500)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/pegawai?search=${debouncedSearch}`)
      const data = await response.json()
      setPegawaiList(data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
        {/* Title */}
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Data Kepegawaian
          </h1>
          <p className="text-sm text-slate-500">
            Kelola data pegawai Rutan Enrekang
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm
      text-slate-900 placeholder:text-slate-400  focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        {/* Button Group */}
        <div className="flex items-center gap-3">
          <ImportExportModal data={pegawaiList} onRefresh={fetchData} />

          <Link
            href="/dashboard/pegawai/create"
            style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
            className="flex items-center justify-center gap-2 rounded-lg px-6 py-2
  text-sm font-semibold hover:bg-[#1e293b] transition shadow-sm"
          >
            <Plus size={18} />
            Tambah Pegawai
          </Link>
        </div>
      </div>



      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
          ) : pegawaiList.length === 0 ? (
            <div className="text-center py-20 px-4 p-2 text-slate-500">
              <p className="text-lg font-semibold">Tidak ada data ditemukan</p>
              <p className="text-sm">Coba kata kunci lain atau tambahkan data baru</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">Nama & NIP</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">Jabatan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">Pangkat</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pegawaiList.map((pegawai, idx) => (
                  <tr key={pegawai.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{pegawai.nama}</div>
                      <div className="text-xs text-slate-500">NIP: {pegawai.nip}</div>
                    </td>

                    {/* KOLOM JABATAN + JADWAL GAJI */}
                    <td className="px-6 py-4">
                      <div className="text-slate-700 font-medium">{pegawai.jabatan}</div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-green-600">
                        <TrendingUp size={12} />
                        <span>TMT GAJI: {new Date(pegawai.jadwalKenaikanGaji).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>

                    {/* KOLOM PANGKAT + JADWAL PANGKAT */}
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {pegawai.golongan?.kode || 'N/A'} - {pegawai.golongan?.nama || 'N/A'}
                      </span>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-orange-600">
                        <Calendar size={12} />
                        <span>TMT PANGKAT: {new Date(pegawai.jadwalNaikPangkat).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <DetailModal pegawai={pegawai} />
                        <Link
                          href={`/dashboard/pegawai/${pegawai.id}/edit`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <DeleteButton id={pegawai.id} onRefresh={fetchData} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}