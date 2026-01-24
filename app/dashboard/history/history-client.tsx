'use client'

import { useState, useTransition } from "react"
import { HistoryFilter } from "@/components/history/history-filter"
import { HistoryStats } from "@/components/history/history-stats"
import { HistoryTable } from "@/components/history/history-table"
import { getLogs, deleteOldLogs } from "@/actions/system-log"
import { LogType } from "@prisma/client"
import { Trash2, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/toast-container"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface HistoryClientProps {
  initialLogs: Awaited<ReturnType<typeof getLogs>>
  stats: Awaited<ReturnType<typeof import("@/actions/system-log").getLogStats>>
}

export function HistoryClient({ initialLogs, stats }: HistoryClientProps) {
  const [logs, setLogs] = useState(initialLogs.logs)
  const [pagination, setPagination] = useState(initialLogs.pagination)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<{
    search: string
    tipe?: LogType
    startDate?: string
    endDate?: string
  }>({ search: "" })
  
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { showToast } = useToast()

  // Handle Filter Change
  const handleFilterChange = async (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
    
    startTransition(async () => {
      const result = await getLogs({
        ...newFilters,
        page: 1,
        limit: 20
      })
      setLogs(result.logs)
      setPagination(result.pagination)
    })
  }

  // Handle Pagination
  const handlePageChange = async (page: number) => {
    setCurrentPage(page)
    
    startTransition(async () => {
      const result = await getLogs({
        ...filters,
        page,
        limit: 20
      })
      setLogs(result.logs)
      setPagination(result.pagination)
    })
  }

  // Handle Refresh
  const handleRefresh = () => {
    startTransition(async () => {
      const result = await getLogs({
        ...filters,
        page: currentPage,
        limit: 20
      })
      setLogs(result.logs)
      setPagination(result.pagination)
      showToast("Data berhasil diperbarui!", "success")
    })
  }

  // Handle Delete Old Logs
  const handleDeleteOldLogs = async () => {
    startTransition(async () => {
      const result = await deleteOldLogs(90) // Hapus log > 90 hari
      
      if (result.success) {
        showToast(`Berhasil menghapus ${result.deletedCount} log lama`, "success")
        
        // Refresh data
        const newData = await getLogs({
          ...filters,
          page: 1,
          limit: 20
        })
        setLogs(newData.logs)
        setPagination(newData.pagination)
        setCurrentPage(1)
      } else {
        showToast(result.error || "Gagal menghapus log lama", "error")
      }
      
      setShowDeleteDialog(false)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Riwayat Aktivitas</h1>
          <p className="text-slate-600 mt-1">Monitor semua aktivitas sistem secara real-time</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isPending ? "animate-spin" : ""} />
            Refresh
          </button>
          
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-red-200"
          >
            <Trash2 size={18} />
            Hapus Log Lama
          </button>
        </div>
      </div>

      {/* Statistics */}
      <HistoryStats 
        total={stats.total} 
        byType={stats.byType} 
      />

      {/* Filter */}
      <HistoryFilter onFilterChange={handleFilterChange} />

      {/* Loading Overlay */}
      {isPending && (
        <div className="backdrop-blur-xl bg-white/70 border border-slate-200/50 rounded-2xl shadow-xl p-8 text-center">
          <Loader2 size={48} className="mx-auto text-[#5E2390] animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Memuat data...</p>
        </div>
      )}

      {/* Table */}
      {!isPending && <HistoryTable logs={logs} />}

      {/* Pagination */}
      {pagination.totalPages > 1 && !isPending && (
        <div className="backdrop-blur-xl bg-white/70 border border-slate-200/50 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              Menampilkan <span className="font-semibold">{logs.length}</span> dari{" "}
              <span className="font-semibold">{pagination.total}</span> log
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        currentPage === pageNum
                          ? "bg-[#5E2390] text-white shadow-lg shadow-purple-200"
                          : "bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Hapus Log Lama?"
        message="Tindakan ini akan menghapus semua log yang lebih dari 90 hari. Data yang dihapus tidak dapat dikembalikan!"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteOldLogs}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />
    </div>
  )
}