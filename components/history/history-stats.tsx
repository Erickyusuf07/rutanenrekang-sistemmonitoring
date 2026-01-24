'use client'

import { Activity, LogIn, LogOut, Plus, Edit, Trash2, Upload } from "lucide-react"
import { LogType } from "@prisma/client"

interface StatsCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}

function StatsCard({ label, value, icon, color }: StatsCardProps) {
  return (
    <div className="backdrop-blur-xl bg-white/70 border border-slate-200/50 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

interface HistoryStatsProps {
  total: number
  byType: Array<{ tipe: LogType; _count: number }>
}

export function HistoryStats({ total, byType }: HistoryStatsProps) {
  const getCount = (type: LogType) => {
    return byType.find(item => item.tipe === type)?._count || 0
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <StatsCard
        label="Total Log"
        value={total}
        icon={<Activity size={24} className="text-[#5E2390]" />}
        color="bg-purple-100"
      />
      <StatsCard
        label="Login"
        value={getCount("LOGIN")}
        icon={<LogIn size={24} className="text-green-600" />}
        color="bg-green-100"
      />
      <StatsCard
        label="Logout"
        value={getCount("LOGOUT")}
        icon={<LogOut size={24} className="text-orange-600" />}
        color="bg-orange-100"
      />
      <StatsCard
        label="Create"
        value={getCount("CREATE")}
        icon={<Plus size={24} className="text-blue-600" />}
        color="bg-blue-100"
      />
      <StatsCard
        label="Update"
        value={getCount("UPDATE")}
        icon={<Edit size={24} className="text-yellow-600" />}
        color="bg-yellow-100"
      />
      <StatsCard
        label="Delete"
        value={getCount("DELETE")}
        icon={<Trash2 size={24} className="text-red-600" />}
        color="bg-red-100"
      />
      <StatsCard
        label="Import"
        value={getCount("IMPORT")}
        icon={<Upload size={24} className="text-indigo-600" />}
        color="bg-indigo-100"
      />
    </div>
  )
}