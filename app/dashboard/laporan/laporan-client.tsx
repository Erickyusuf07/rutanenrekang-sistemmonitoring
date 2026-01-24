'use client'

import { useState } from "react"
import { FileText, Users, Scale, Calendar, Download, Loader2, Filter, RefreshCw } from "lucide-react"
import { generateLaporanPDF } from "@/actions/laporan-actions"

type TabType = 'pegawai' | 'wbp' | 'rekapitulasi'
type FilterMode = 'bulan' | 'tahun' | 'custom'

export default function LaporanClient() {
  const [activeTab, setActiveTab] = useState<TabType>('pegawai')
  const [isLoading, setIsLoading] = useState(false)
  
  // Filter state dengan mode dinamis
  const [filterMode, setFilterMode] = useState<FilterMode>('bulan')
  const [bulanMulai, setBulanMulai] = useState<number>(new Date().getMonth() + 1)
  const [bulanSelesai, setBulanSelesai] = useState<number>(new Date().getMonth() + 1)
  const [tahunMulai, setTahunMulai] = useState<number>(new Date().getFullYear())
  const [tahunSelesai, setTahunSelesai] = useState<number>(new Date().getFullYear())
  const [status, setStatus] = useState<string>('AKTIF')

  // Generate list tahun dinamis (10 tahun ke belakang sampai 5 tahun ke depan)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 16 }, (_, i) => currentYear - 10 + i)

  // Handle generate PDF
  async function handleGenerate(jenis: string) {
    setIsLoading(true)
    try {
      const params = { 
        jenis, 
        filterMode,
        bulanMulai,
        bulanSelesai,
        tahunMulai, 
        tahunSelesai,
        status 
      }
      const result = await generateLaporanPDF(params)
      
      if (result.success) {
        // Download PDF
        const link = document.createElement('a')
        link.href = result.pdfUrl!
        link.download = result.fileName!
        link.click()
      } else {
        alert(result.error || 'Gagal generate PDF')
      }
    } catch (error) {
      console.error('Error generate PDF:', error)
      alert('Gagal generate PDF')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset filter
  function handleReset() {
    setFilterMode('bulan')
    setBulanMulai(new Date().getMonth() + 1)
    setBulanSelesai(new Date().getMonth() + 1)
    setTahunMulai(currentYear)
    setTahunSelesai(currentYear)
    setStatus('AKTIF')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-800">
                Laporan & Rekapitulasi
              </h1>
              <p className="text-slate-500 mt-2 text-sm">
                Generate dan export laporan PDF dengan filter kalender dinamis
              </p>
            </div>
            <div className="hidden md:block">
              <div className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200">
                {new Date().toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('pegawai')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'pegawai'
                  ? 'bg-[#5E2390] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Users className="inline mr-2" size={18} />
              Pegawai
            </button>
            <button
              onClick={() => setActiveTab('wbp')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'wbp'
                  ? 'bg-[#5E2390] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Scale className="inline mr-2" size={18} />
              Warga Binaan
            </button>
            <button
              onClick={() => setActiveTab('rekapitulasi')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'rekapitulasi'
                  ? 'bg-[#5E2390] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Calendar className="inline mr-2" size={18} />
              Rekapitulasi
            </button>
          </div>
        </div>

        {/* FILTER KALENDER DINAMIS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-[#5E2390]">
              <Filter className="text-white" size={18} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Filter Kalender</h3>
          </div>
          
          {/* MODE FILTER */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
              Mode Filter
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterMode('bulan')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  filterMode === 'bulan'
                    ? 'bg-[#5E2390] text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                Filter Bulan
              </button>
              <button
                onClick={() => setFilterMode('tahun')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  filterMode === 'tahun'
                    ? 'bg-[#5E2390] text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                Filter Tahun
              </button>
              <button
                onClick={() => setFilterMode('custom')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  filterMode === 'custom'
                    ? 'bg-[#5E2390] text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* FILTER BULAN MODE */}
            {filterMode === 'bulan' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                    Bulan
                  </label>
                  <select
                    value={bulanMulai}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setBulanMulai(val)
                      setBulanSelesai(val)
                    }}
                    className="w-full px-4 py-2.5 border border-slate-300 text-black rounded-lg text-sm font-medium focus:outline-none focus:border-[#5E2390] focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString('id-ID', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                    Tahun
                  </label>
                  <select
                    value={tahunMulai}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setTahunMulai(val)
                      setTahunSelesai(val)
                    }}
                    className="w-full px-4 py-2.5 border border-slate-300 text-black rounded-lg text-sm font-medium focus:outline-none focus:border-[#5E2390] focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* FILTER TAHUN MODE */}
            {filterMode === 'tahun' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                  Tahun
                </label>
                <select
                  value={tahunMulai}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setTahunMulai(val)
                    setTahunSelesai(val)
                    setBulanMulai(1)
                    setBulanSelesai(12)
                  }}
                  className="w-full px-4 py-2.5 border border-slate-300 text-black rounded-lg text-sm font-medium focus:outline-none focus:border-[#5E2390] focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {/* FILTER CUSTOM RANGE MODE */}
            {filterMode === 'custom' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                    Bulan Mulai
                  </label>
                  <select
                    value={bulanMulai}
                    onChange={(e) => setBulanMulai(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 text-black rounded-lg text-sm font-medium focus:outline-none focus:border-[#5E2390] focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString('id-ID', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                    Tahun Mulai
                  </label>
                  <select
                    value={tahunMulai}
                    onChange={(e) => setTahunMulai(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 text-black rounded-lg text-sm font-medium focus:outline-none focus:border-[#5E2390] focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                    Bulan Selesai
                  </label>
                  <select
                    value={bulanSelesai}
                    onChange={(e) => setBulanSelesai(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 text-black rounded-lg text-sm font-medium focus:outline-none focus:border-[#5E2390] focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString('id-ID', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                    Tahun Selesai
                  </label>
                  <select
                    value={tahunSelesai}
                    onChange={(e) => setTahunSelesai(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 text-black rounded-lg text-sm font-medium focus:outline-none focus:border-[#5E2390] focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* STATUS */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 text-black rounded-lg text-sm font-medium focus:outline-none focus:border-[#5E2390] focus:ring-2 focus:ring-purple-100 transition-all bg-white"
              >
                <option value="AKTIF">Aktif</option>
                <option value="PENSIUN">Pensiun</option>
                <option value="SEMUA">Semua</option>
              </select>
            </div>

            {/* RESET */}
            <div className="flex items-end">
              <button
                onClick={handleReset}
                className="w-full px-4 py-2.5 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>
          </div>

          {/* INFO FILTER */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600">
              <span className="font-bold">Periode: </span>
              {filterMode === 'bulan' && (
                `${new Date(2000, bulanMulai - 1).toLocaleString('id-ID', { month: 'long' })} ${tahunMulai}`
              )}
              {filterMode === 'tahun' && (
                `Tahun ${tahunMulai}`
              )}
              {filterMode === 'custom' && (
                `${new Date(2000, bulanMulai - 1).toLocaleString('id-ID', { month: 'short' })} ${tahunMulai} - ${new Date(2000, bulanSelesai - 1).toLocaleString('id-ID', { month: 'short' })} ${tahunSelesai}`
              )}
              <span className="ml-3 font-bold">Status: </span>{status}
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-3">
          {activeTab === 'pegawai' && (
            <>
              <LaporanItem
                title="Daftar Pegawai"
                description="Laporan lengkap semua data pegawai sesuai filter"
                icon={<Users size={20} />}
                onClick={() => handleGenerate('pegawai-daftar')}
                isLoading={isLoading}
              />
              <LaporanItem
                title="Kenaikan Pangkat"
                description="Pegawai yang jatuh tempo kenaikan pangkat"
                icon={<FileText size={20} />}
                onClick={() => handleGenerate('pegawai-pangkat')}
                isLoading={isLoading}
              />
              <LaporanItem
                title="Kenaikan Gaji Berkala"
                description="Pegawai yang jatuh tempo kenaikan gaji"
                icon={<FileText size={20} />}
                onClick={() => handleGenerate('pegawai-gaji')}
                isLoading={isLoading}
              />
              <LaporanItem
                title="Pegawai per Golongan"
                description="Breakdown pegawai berdasarkan golongan"
                icon={<FileText size={20} />}
                onClick={() => handleGenerate('pegawai-golongan')}
                isLoading={isLoading}
              />
            </>
          )}

          {activeTab === 'wbp' && (
            <>
              <LaporanItem
                title="Daftar WBP"
                description="Laporan lengkap semua data warga binaan sesuai filter"
                icon={<Scale size={20} />}
                onClick={() => handleGenerate('wbp-daftar')}
                isLoading={isLoading}
              />
              <LaporanItem
                title="Jadwal Pembebasan"
                description="WBP yang akan segera bebas dalam periode ini"
                icon={<FileText size={20} />}
                onClick={() => handleGenerate('wbp-bebas')}
                isLoading={isLoading}
              />
              <LaporanItem
                title="Status Mapenaling"
                description="Status dan jadwal mapenaling WBP"
                icon={<FileText size={20} />}
                onClick={() => handleGenerate('wbp-mapenaling')}
                isLoading={isLoading}
              />
              <LaporanItem
                title="WBP per Jenis Perkara"
                description="Breakdown WBP berdasarkan jenis perkara"
                icon={<FileText size={20} />}
                onClick={() => handleGenerate('wbp-perkara')}
                isLoading={isLoading}
              />
            </>
          )}

          {activeTab === 'rekapitulasi' && (
            <>
              <LaporanItem
                title="Rekapitulasi Pegawai"
                description="Statistik lengkap pegawai per periode"
                icon={<Calendar size={20} />}
                onClick={() => handleGenerate('rekap-pegawai')}
                isLoading={isLoading}
              />
              <LaporanItem
                title="Rekapitulasi WBP"
                description="Statistik lengkap WBP per periode"
                icon={<Calendar size={20} />}
                onClick={() => handleGenerate('rekap-wbp')}
                isLoading={isLoading}
              />
              <LaporanItem
                title="Rekapitulasi Gabungan"
                description="Statistik gabungan pegawai & WBP"
                icon={<Calendar size={20} />}
                onClick={() => handleGenerate('rekap-gabungan')}
                isLoading={isLoading}
              />
            </>
          )}
        </div>

      </div>
    </div>
  )
}

// Component Item Laporan
function LaporanItem({
  title,
  description,
  icon,
  onClick,
  isLoading
}: {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  isLoading: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full bg-white rounded-xl border border-slate-200 p-5 hover:border-[#5E2390] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:shadow-none group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#5E2390] group-hover:text-white transition-all">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-800 text-base mb-1">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <Loader2 size={16} className="animate-spin" />
              <span>Generating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#5E2390] font-bold text-sm">
              <Download size={18} />
              <span>Download PDF</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}