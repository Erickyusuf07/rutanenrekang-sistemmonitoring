import { db } from "@/lib/db"
import Link from "next/link"
import { Plus, Calendar, Clock, MapPin, Pencil, CheckCircle2 } from "lucide-react"
import { AgendaSearchFilter } from "./search-filter"
import DeleteAgendaButton from "./delete-button"
import { Prisma } from "@prisma/client"

interface AgendaPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
  }>
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const params = await searchParams
  const { search, status } = params

  // ✅ AUTO-UPDATE STATUS BERDASARKAN WAKTU
  const now = new Date()
  
  // Update agenda yang sudah melewati waktu selesai menjadi "selesai"
  await db.agendaKarutan.updateMany({
    where: {
      isSelesai: false,
      waktuSelesai: {
        not: null,
        lt: now // waktuSelesai < sekarang
      }
    },
    data: {
      isSelesai: true
    }
  })

  // ✅ BUILD FILTER
  const where: Prisma.AgendaKarutanWhereInput = {}

  if (search) {
    where.judul = {
      contains: search,
      mode: "insensitive"
    }
  }

  if (status === "selesai") {
    where.isSelesai = true
  } else if (status === "aktif") {
    where.isSelesai = false
  }

  // Fetch data
  const agendaList = await db.agendaKarutan.findMany({
    where,
    orderBy: [
      { waktuMulai: "desc" },
      { createdAt: "desc" }
    ]
  })

  // ✅ STATISTICS
  const stats = {
    total: agendaList.length,
    aktif: agendaList.filter((a) => !a.isSelesai).length,
    selesai: agendaList.filter((a) => a.isSelesai).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agenda Kegiatan</h1>
          <p className="text-sm text-slate-500">Kelola jadwal kegiatan di Rutan Enrekang</p>
        </div>
        
        <Link
          href="/dashboard/agenda/create"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-blue-200"
        >
          <Plus size={18} />
          Tambah Agenda
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Agenda</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="rounded-full bg-slate-50 p-3">
              <Calendar className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Sedang Berjalan</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats.aktif}</p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Selesai</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{stats.selesai}</p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <AgendaSearchFilter />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Agenda</th>
                <th className="px-6 py-4 font-semibold">Waktu</th>
                <th className="px-6 py-4 font-semibold">Lokasi</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agendaList.map((agenda) => {
                // ✅ LOGIC: Cek apakah agenda sudah lewat waktu selesai
                const isExpired = agenda.waktuSelesai && new Date(agenda.waktuSelesai) < now
                const displayStatus = isExpired || agenda.isSelesai

                return (
                  <tr key={agenda.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-800">{agenda.judul}</div>
                        {agenda.deskripsi && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {agenda.deskripsi}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-xs">
                            {new Date(agenda.waktuMulai).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-xs">
                            {new Date(agenda.waktuMulai).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                            {agenda.waktuSelesai && (
                              <> - {new Date(agenda.waktuSelesai).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}</>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="text-xs">{agenda.lokasi || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {displayStatus ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCircle2 size={12} />
                          Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          <Clock size={12} />
                          Sedang Berjalan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/agenda/${agenda.id}/edit`}
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100"
                          title="Edit Agenda"
                        >
                          <Pencil size={16} />
                        </Link>
                        <DeleteAgendaButton id={agenda.id} judul={agenda.judul} />
                      </div>
                    </td>
                  </tr>
                )
              })}

              {agendaList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-sm font-medium text-slate-500">
                        {search || status
                          ? "Tidak ada agenda yang sesuai filter"
                          : "Belum ada agenda"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}