import { db } from "@/lib/db"
import PengumumanDisplayList from "./pengumuman-display-list"

export const metadata = {
  title: "Pengumuman Display TV | RUTAN Enrekang"
}

export default async function PengumumanDisplayPage() {
  const pengumumanList = await db.pengumuman.findMany({
    orderBy: [
      { isPriority: "desc" },
      { createdAt: "desc" }
    ]
  })

  const stats = {
    total: pengumumanList.length,
    active: pengumumanList.filter(p => p.isActive).length,
    priority: pengumumanList.filter(p => p.isPriority).length,
    info: pengumumanList.filter(p => p.tipe === "INFO").length,
    warning: pengumumanList.filter(p => p.tipe === "WARNING").length,
    urgent: pengumumanList.filter(p => p.tipe === "URGENT").length,
    success: pengumumanList.filter(p => p.tipe === "SUCCESS").length,
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Pengumuman Display TV</h1>
          <p className="text-slate-600 mt-1">Kelola informasi yang ditampilkan di layar monitoring</p>
        </div>

        <PengumumanDisplayList 
          pengumumanList={pengumumanList}
          stats={stats}
        />
      </div>
    </div>
  )
}