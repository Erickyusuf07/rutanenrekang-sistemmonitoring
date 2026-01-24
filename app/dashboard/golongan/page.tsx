// app/dashboard/golongan/page.tsx
import { db } from "@/lib/db"
import { Layers } from "lucide-react"
import CreateGolonganForm from "./create-form"
import EditGolonganModal from "./edit-modal"
import DeleteGolonganButton from "./delete-button"

export const revalidate = 1 

export default async function GolonganPage() {
  const listGolongan = await db.golongan.findMany({
    orderBy: { kode: 'asc' }
  })

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER BARU: Putih Bersih dengan Teks Ungu (Pasti Terbaca) */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
         <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-[#5E2390]">
              <Layers size={24} />
            </div>
            <div>
              {/* Teks Gelap agar kontras */}
              <h1 className="text-2xl font-bold text-slate-800">Master Data Pangkat</h1>
              <p className="text-sm text-slate-500">Kelola referensi golongan dan pangkat pegawai.</p>
            </div>
         </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        
        {/* KOLOM KIRI: Form Tambah */}
        <div className="lg:col-span-1 lg:sticky lg:top-8">
          <CreateGolonganForm />
        </div>

        {/* KOLOM KANAN: Tabel Data */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <h3 className="font-bold text-slate-700">Daftar Pangkat ({listGolongan.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Kode</th>
                    <th className="px-6 py-4 font-bold">Nama Pangkat</th>
                    <th className="px-6 py-4 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listGolongan.map((g) => (
                    <tr key={g.id} className="group hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700 group-hover:bg-[#5E2390] group-hover:text-white transition-colors">
                          {g.kode}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {g.nama}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <EditGolonganModal data={g} />
                          <DeleteGolonganButton id={g.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {listGolongan.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                        Belum ada data. Silakan tambah di formulir samping.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}