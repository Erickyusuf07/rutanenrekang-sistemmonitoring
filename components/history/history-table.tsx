'use client'

import { formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { 
  Activity, 
  LogIn, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  User,
  Clock,
  Info
} from "lucide-react"
import { LogType } from "@prisma/client"
import { useState } from "react"

interface LogEntry {
  id: string
  aktivitas: string
  tipe: LogType
  detail?: string | null
  waktu: Date
  admin: {
    namaLengkap: string
    username: string
  }
}

interface HistoryTableProps {
  logs: LogEntry[]
}

// Helper: Get icon & color based on log type
function getLogStyle(tipe: LogType) {
  const styles = {
    LOGIN: {
      icon: <LogIn size={18} />,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200"
    },
    LOGOUT: {
      icon: <LogOut size={18} />,
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      borderColor: "border-orange-200"
    },
    CREATE: {
      icon: <Plus size={18} />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200"
    },
    UPDATE: {
      icon: <Edit size={18} />,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-200"
    },
    DELETE: {
      icon: <Trash2 size={18} />,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200"
    },
    EXPORT: {
      icon: <Download size={18} />,
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      borderColor: "border-teal-200"
    },
    IMPORT: {
      icon: <Upload size={18} />,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-200"
    },
    FORGOT_PASSWORD: {
      icon: <Activity size={18} />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200"
    },
    RESET_PASSWORD: {
      icon: <Activity size={18} />,
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
      borderColor: "border-pink-200"
    }
  } as const
  return styles[tipe] || styles.CREATE
}

// Detail Modal Component
function DetailModal({ 
  log, 
  onClose 
}: { 
  log: LogEntry
  onClose: () => void 
}) {
  const style = getLogStyle(log.tipe)
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="backdrop-blur-xl bg-white/95 border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${style.bgColor} ${style.textColor}`}>
                {style.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Detail Aktivitas</h3>
                <p className="text-sm text-slate-500">ID: {log.id.substring(0, 8)}...</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="text-2xl text-slate-400">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tipe */}
          <div>
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Tipe Aktivitas
            </label>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${style.bgColor} ${style.textColor} font-semibold`}>
                {style.icon}
                {log.tipe}
              </span>
            </div>
          </div>

          {/* Aktivitas */}
          <div>
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Deskripsi
            </label>
            <p className="mt-2 text-slate-900 text-base leading-relaxed bg-slate-50 p-4 rounded-xl">
              {log.aktivitas}
            </p>
          </div>

          {/* Admin */}
          <div>
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Dilakukan Oleh
            </label>
            <div className="mt-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
              <div className="p-2 bg-[#5E2390] rounded-lg">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{log.admin.namaLengkap}</p>
                <p className="text-sm text-slate-500">@{log.admin.username}</p>
              </div>
            </div>
          </div>

          {/* Waktu */}
          <div>
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Waktu
            </label>
            <div className="mt-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
              <div className="p-2 bg-slate-200 rounded-lg">
                <Clock size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {new Date(log.waktu).toLocaleString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
                <p className="text-sm text-slate-500">
                  {formatDistanceToNow(new Date(log.waktu), { 
                    addSuffix: true, 
                    locale: localeId 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Detail (JSON) */}
          {log.detail && (
            <div>
              <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Detail Teknis
              </label>
              <div className="mt-2 bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto">
                <pre className="text-xs font-mono">
                  {JSON.stringify(JSON.parse(log.detail), null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-6">
          <button
            onClick={onClose}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export function HistoryTable({ logs }: HistoryTableProps) {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  if (logs.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/70 border border-slate-200/50 rounded-2xl shadow-xl p-12 text-center">
        <Activity size={64} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 text-lg font-medium">Tidak ada riwayat aktivitas</p>
        <p className="text-slate-400 text-sm mt-2">Log aktivitas akan muncul di sini</p>
      </div>
    )
  }

  return (
    <>
      <div className="backdrop-blur-xl bg-white/70 border border-slate-200/50 rounded-2xl shadow-xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#5E2390] to-[#4C1D95] text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold">Tipe</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Aktivitas</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Admin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Waktu</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => {
                const style = getLogStyle(log.tipe)
                return (
                  <tr 
                    key={log.id} 
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${style.bgColor} ${style.textColor} ${style.borderColor} border`}>
                        {style.icon}
                        {log.tipe}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">
                        {log.aktivitas}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#5E2390] rounded-lg flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {log.admin.namaLengkap}
                          </p>
                          <p className="text-xs text-slate-500">
                            @{log.admin.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">
                        {new Date(log.waktu).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(log.waktu).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all"
                      >
                        <Info size={16} />
                        Detail
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-200">
          {logs.map((log) => {
            const style = getLogStyle(log.tipe)
            return (
              <div 
                key={log.id} 
                className="p-4 hover:bg-white/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${style.bgColor} ${style.textColor}`}>
                    {style.icon}
                    {log.tipe}
                  </span>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(log.waktu), { 
                      addSuffix: true, 
                      locale: localeId 
                    })}
                  </p>
                </div>
                
                <p className="text-sm font-medium text-slate-900 mb-3">
                  {log.aktivitas}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#5E2390] rounded-md flex items-center justify-center">
                      <User size={12} className="text-white" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      {log.admin.namaLengkap}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="text-xs text-[#5E2390] font-semibold hover:underline"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <DetailModal 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
        />
      )}
    </>
  )
}