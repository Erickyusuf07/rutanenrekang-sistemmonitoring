'use client'

import { useState } from "react"
import { Search, Filter, Calendar, X } from "lucide-react"
import { LogType } from "@prisma/client"

interface HistoryFilterProps {
  onFilterChange: (filters: {
    search: string
    tipe?: LogType
    startDate?: string
    endDate?: string
  }) => void
}

export function HistoryFilter({ onFilterChange }: HistoryFilterProps) {
  const [search, setSearch] = useState("")
  const [tipe, setTipe] = useState<LogType | "">("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({
      search,
      tipe: tipe || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    })
  }

  const handleReset = () => {
    setSearch("")
    setTipe("")
    setStartDate("")
    setEndDate("")
    onFilterChange({ search: "" })
  }

  return (
    <div className="backdrop-blur-xl bg-white/70 border border-slate-200/50 rounded-2xl shadow-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aktivitas..."
            className="w-full pl-12 pr-4 py-3 rounded-xl text-black border border-slate-200 focus:ring-2 focus:ring-[#5E2390] focus:border-transparent transition-all"
          />
        </div>

        {/* Advanced Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-[#5E2390] hover:text-[#4C1D95] font-medium transition-colors"
        >
          <Filter size={16} />
          {showAdvanced ? "Sembunyikan" : "Tampilkan"} Filter Lanjutan
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            {/* Tipe Log */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipe Aktivitas
              </label>
              <select
                value={tipe}
                onChange={(e) => setTipe(e.target.value as LogType | "")}
                className="w-full px-4 py-2.5 rounded-xl text-black border border-slate-200 focus:ring-2 focus:ring-[#5E2390] focus:border-transparent transition-all"
              >
                <option value="">Semua Tipe</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="EXPORT">Export</option>
                <option value="IMPORT">Import</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-black border border-slate-200 focus:ring-2 focus:ring-[#5E2390] focus:border-transparent transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-black border border-slate-200 focus:ring-2 focus:ring-[#5E2390] focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-[#5E2390] hover:bg-[#4C1D95] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-200 hover:shadow-xl"
          >
            <Search size={18} className="inline mr-2" />
            Cari
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 font-semibold transition-all"
          >
            <X size={18} className="inline mr-2" />
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}