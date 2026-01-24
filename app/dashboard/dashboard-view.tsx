'use client'

import { memo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend} from 'recharts'
import { Users, ShieldCheck, FileText, CalendarClock, TrendingUp, Activity, AlertCircle, CheckCircle, LucideIcon } from "lucide-react"

// --- TYPE DEFINITIONS ---
interface StatCardProps {
  title: string
  value: number
  label: string
  icon: LucideIcon
  bgClass: string
  iconClass: string
  borderClass: string
}

interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

interface TrendData {
  bulan: string
  masuk: number
  keluar: number
}

interface DashboardProps {
  stats: {
    totalPegawai: number
    totalWBP: number
    agendaHariIni: number
    totalPerkara: number
  }
  chartGolongan: ChartData[]
  chartPerkara: ChartData[]
  chartStatusWBP: ChartData[]
  chartJenisKelamin: ChartData[]
  chartUsiaPegawai: ChartData[]
  chartTrend: TrendData[]
}

interface TooltipPayloadItem {
  value: number
  name: string
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

// --- KOMPONEN STAT CARD (MEMOIZED - PERFORMA!) ---
const StatCard = memo(({ title, value, label, icon: Icon, bgClass, iconClass, borderClass }: StatCardProps) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border ${borderClass} hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">{title}</p>
          <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgClass}`}>
          <Icon size={24} className={iconClass} />
        </div>
      </div>
    </div>
  )
})
StatCard.displayName = 'StatCard'

// --- TOOLTIP GRAFIK (MEMOIZED) ---
const CustomTooltip = memo(({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
        <p className="mb-1 text-xs font-bold uppercase text-slate-400">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold text-slate-800">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: <span className="font-normal">{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
})
CustomTooltip.displayName = 'CustomTooltip'

export default function DashboardView({
  stats,
  chartGolongan,
  chartPerkara,
  chartStatusWBP,
  chartJenisKelamin,
  chartUsiaPegawai,
  chartTrend
}: DashboardProps) {

  const COLORS = ['#5E2390', '#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']

  // Safety Check
  const safeChartGolongan = chartGolongan.length > 0 ? chartGolongan : [{ name: 'Belum Ada Data', value: 0 }]
  const safeChartPerkara = chartPerkara.length > 0 ? chartPerkara : [{ name: 'Belum Ada Data', value: 0 }]
  const safeChartStatus = chartStatusWBP.length > 0 ? chartStatusWBP : [{ name: 'Belum Ada Data', value: 0 }]
  const safeChartGender = chartJenisKelamin.length > 0 ? chartJenisKelamin : [{ name: 'Belum Ada Data', value: 0 }]
  const safeChartAge = chartUsiaPegawai.length > 0 ? chartUsiaPegawai : [{ name: 'Belum Ada Data', value: 0 }]



  return (
    <div className="space-y-8 pb-20">

      {/* HEADER DASHBOARD */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-10">
          <Activity size={200} className="text-slate-400" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black md:text-4xl text-slate-900 tracking-tight">
            Dashboard Monitoring
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600 text-sm md:text-base font-medium leading-relaxed">
            Pusat data real-time Rutan Kelas IIB Enrekang. Statistik pegawai, WBP, dan agenda harian.
          </p>
        </div>
      </div>

      {/* GRID KARTU STATISTIK */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pegawai"
          value={stats.totalPegawai}
          label="Personil Aktif"
          icon={ShieldCheck}
          bgClass="bg-blue-50"
          iconClass="text-blue-600"
          borderClass="border-blue-100"
        />
        <StatCard
          title="Warga Binaan"
          value={stats.totalWBP}
          label="Penghuni Saat Ini"
          icon={Users}
          bgClass="bg-orange-50"
          iconClass="text-orange-600"
          borderClass="border-orange-100"
        />
        <StatCard
          title="Agenda Hari Ini"
          value={stats.agendaHariIni}
          label="Kegiatan Karutan"
          icon={CalendarClock}
          bgClass="bg-purple-50"
          iconClass="text-purple-700"
          borderClass="border-purple-100"
        />
        <StatCard
          title="Total Kasus"
          value={stats.totalPerkara}
          label="Jenis Perkara"
          icon={FileText}
          bgClass="bg-emerald-50"
          iconClass="text-emerald-700"
          borderClass="border-emerald-100"
        />
      </div>

      {/* BARIS PERTAMA: Grafik Utama */}
      <div className="grid gap-8 lg:grid-cols-2">

        {/* GRAFIK 1: Distribusi Pangkat */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-w-0">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-700">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Distribusi Pangkat</h3>
              <p className="text-xs text-slate-500">Jumlah pegawai per golongan</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 300, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeChartGolongan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar
                  dataKey="value"
                  fill="#5E2390"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                  name="Jumlah"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ✅ GRAFIK 2: Statistik Kasus WBP - COMPOSED CHART DENGAN MULTIPLE AREAS! */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-w-0">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Statistik Kasus WBP</h3>
              <p className="text-xs text-slate-500">Top 5 kasus terbanyak</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={safeChartPerkara}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                {/* ✅ GRADIENT UNTUK AREA (GELAP KE TERANG) */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c2410c" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#fed7aa" stopOpacity={0.1} />
                  </linearGradient>
                  {/* ✅ GRADIENT UNTUK GARIS (HORIZONTAL) */}
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7c2d12" />
                    <stop offset="25%" stopColor="#9a3412" />
                    <stop offset="50%" stopColor="#c2410c" />
                    <stop offset="75%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  hide
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 9, fontWeight: 600 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* ✅ AREA DENGAN GRADIENT FILL */}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  fillOpacity={1}
                  dot={false} // ✅ HAPUS TITIK BULAT!
                  activeDot={false} // ✅ HAPUS TITIK SAAT HOVER!
                  name="Jumlah Kasus"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ✅ LABEL DENGAN WARNA GRADIENT ORANGE BERBEDA */}
          <div className="mt-4 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <div className="flex flex-wrap gap-2">
              {safeChartPerkara.map((item, index) => {
                const colors = ['#7c2d12', '#9a3412', '#c2410c', '#ea580c', '#f97316']
                const bgColors = ['#7c2d1215', '#9a341215', '#c2410c15', '#ea580c15', '#f9731615']
                return (
                  <span
                    key={index}
                    className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold whitespace-nowrap shadow-sm transition-all hover:shadow-md"
                    style={{
                      borderColor: colors[index % colors.length],
                      backgroundColor: bgColors[index % bgColors.length],
                      color: colors[index % colors.length]
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></span>
                    <span className="truncate max-w-[140px]" title={item.name}>
                      {item.name}: {item.value}
                    </span>
                  </span>
                )
              })}
            </div>
          </div>
        </div>

      </div>

      {/* BARIS KEDUA: Grafik Pie & Bar */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* PIE CHART 1: Status WBP */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-w-0">
          <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <CheckCircle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Status WBP</h3>
              <p className="text-xs text-slate-500">Berdasarkan Status Database</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 240, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeChartStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {safeChartStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            {safeChartStatus.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PIE CHART 2: Jenis Kelamin */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-w-0">
          <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-pink-50 p-2 text-pink-600">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Jenis Kelamin WBP</h3>
              <p className="text-xs text-slate-500">Data Real-Time</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 240, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeChartGender}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {safeChartGender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[COLORS[1], COLORS[5]][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            {safeChartGender.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: [COLORS[1], COLORS[5]][idx] }}></span>
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BAR CHART: Usia Pegawai */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-w-0">
          <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Usia Pegawai</h3>
              <p className="text-xs text-slate-500">Data Real-Time</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 240, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeChartAge} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} name="Jumlah" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* BARIS KETIGA: Line Chart Trend */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-w-0">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Trend WBP Tahun Ini</h3>
            <p className="text-xs text-slate-500">Jumlah WBP masuk & keluar per bulan</p>
          </div>
        </div>

        <div style={{ width: '100%', height: 300, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="bulan"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="masuk"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#3b82f6' }}
                activeDot={{ r: 7 }}
                name="WBP Masuk"
              />
              <Line
                type="monotone"
                dataKey="keluar"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: '#10b981' }}
                activeDot={{ r: 7 }}
                name="WBP Keluar"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}