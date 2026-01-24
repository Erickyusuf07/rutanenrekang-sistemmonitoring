"use client"

import { Search, Filter, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

export function AgendaSearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [showFilter, setShowFilter] = useState(false)

  const handleSearch = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const handleStatusFilter = (value: string) => {
    setStatus(value)
    const params = new URLSearchParams(searchParams.toString())
    
    if (value !== "all") {
      params.set("status", value)
    } else {
      params.delete("status")
    }
    
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const handleReset = () => {
    setSearch("")
    setStatus("all")
    startTransition(() => {
      router.push("/dashboard/agenda")
    })
  }

  return (
    <div className="p-4 border-b border-slate-200 bg-slate-50/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari judul agenda..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border text-slate-900 border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              showFilter
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter size={16} />
            Filter
          </button>

          {(search || status !== "all") && (
            <button
              onClick={handleReset}
              className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status Agenda
              </label>
              <div className="flex flex-wrap gap-2">
                {/* ✅ FIX: Gunakan class lengkap, bukan template string */}
                <button
                  onClick={() => handleStatusFilter("all")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    status === "all"
                      ? "bg-slate-100 text-slate-700 border-2 border-slate-400"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Semua
                </button>

                <button
                  onClick={() => handleStatusFilter("aktif")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    status === "aktif"
                      ? "bg-green-100 text-green-700 border-2 border-green-400"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Sedang Berjalan
                </button>

                <button
                  onClick={() => handleStatusFilter("selesai")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    status === "selesai"
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-400"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isPending && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
          Memuat data...
        </div>
      )}
    </div>
  )
}