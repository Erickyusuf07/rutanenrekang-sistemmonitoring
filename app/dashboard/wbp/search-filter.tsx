"use client"

import { Search, Filter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export function WBPSearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")

  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (status) params.set("status", status)
    router.push(`?${params.toString()}`)
  }, [query, status, router])

  return (
    <div className="border-b border-slate-100 px-6 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, No. Reg, NIK..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 text-black bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-[#5E2390] focus:outline-none focus:ring-1 focus:ring-[#5E2390]"
          />
        </div>

        {/* Filter Status */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-slate-50 text-black py-2 pl-9 pr-10 text-sm focus:border-[#5E2390] focus:outline-none focus:ring-1 focus:ring-[#5E2390]"
          >
            <option value="">Semua Status</option>
            <option value="MAPENALING">Mapenaling</option>
            <option value="NORMAL">Normal</option>
            <option value="ISOLASI">Isolasi</option>
            <option value="KARANTINA">Karantina</option>
          </select>
        </div>

        {/* Reset */}
        {(query || status) && (
          <button
            onClick={() => {
              setQuery("")
              setStatus("")
            }}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Reset Filter
          </button>
        )}
      </div>
    </div>
  )
}