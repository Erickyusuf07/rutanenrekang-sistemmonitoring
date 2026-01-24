import { getLogs, getLogStats } from "@/actions/system-log"
import { HistoryClient } from "./history-client"


export const metadata = {
  title: "Riwayat Aktivitas | RUTAN Enrekang",
  description: "Monitor riwayat aktivitas sistem"
}

export default async function HistoryPage() {

  // ✅ Fetch Data dari Server
  const [initialLogs, stats] = await Promise.all([
    getLogs({ page: 1, limit: 20 }),
    getLogStats()
  ])

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-slate-100 p-6">
      <HistoryClient 
        initialLogs={initialLogs} 
        stats={stats} 
      />
    </div>
  )
}