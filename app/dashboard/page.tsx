import { db } from "@/lib/db"
import DashboardView from "./dashboard-view"

export const revalidate = 0 // Data selalu fresh

export default async function DashboardPage() {
  // 1. STATISTIK DASAR
  const totalPegawai = await db.pegawai.count({ where: { status: 'AKTIF' } })
  const totalWBP = await db.wargaBinaan.count({ where: { status: 'AKTIF' } })

  // Agenda Hari Ini
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const agendaHariIni = await db.agendaKarutan.count({
    where: {
      waktuMulai: { gte: todayStart, lte: todayEnd }
    }
  })

  // 2. GRAFIK GOLONGAN PEGAWAI
  const golonganStats = await db.pegawai.groupBy({
    by: ['golonganId'],
    where: { status: 'AKTIF' },
    _count: { golonganId: true }
  })

  const allGolongan = await db.golongan.findMany({
    select: { id: true, kode: true }
  })

  const chartGolongan = golonganStats
    .map(item => {
      const golongan = allGolongan.find(g => g.id === item.golonganId)
      return {
        name: golongan?.kode || 'N/A',
        value: item._count.golonganId
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  // 3. GRAFIK PERKARA WBP (TOP 5 SAJA!)
  const perkaraStats = await db.wargaBinaan.groupBy({
    by: ['perkara'],
    where: { status: 'AKTIF' },
    _count: { perkara: true }
  })

  const chartPerkara = perkaraStats
    .map(item => ({
      name: item.perkara || 'Tidak Disebutkan',
      value: item._count.perkara
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // ✅ AMBIL 5 TERBESAR SAJA

  const totalPerkara = perkaraStats.length

  // 4. STATUS WBP (PIE CHART)
  const statusStats = await db.wargaBinaan.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  const chartStatusWBP = statusStats.map(item => ({
    name: item.status,
    value: item._count.status
  }))

  // 5. JENIS KELAMIN WBP (PIE CHART - REAL DATA!)
  const genderStats = await db.wargaBinaan.groupBy({
    by: ['jenisKelamin'],
    where: { status: 'AKTIF' },
    _count: { jenisKelamin: true }
  })

  const chartJenisKelamin = genderStats.map(item => ({
    name: item.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan',
    value: item._count.jenisKelamin
  }))

  // 6. USIA PEGAWAI (BAR CHART - REAL DATA!)
  const allPegawai = await db.pegawai.findMany({
    where: { status: 'AKTIF' },
    select: { tanggalLahir: true }
  })

  const currentYear = new Date().getFullYear()
  const ageGroups = { '20-30': 0, '31-40': 0, '41-50': 0, '50+': 0 }

  allPegawai.forEach(p => {
    if (!p.tanggalLahir) return
    const age = currentYear - new Date(p.tanggalLahir).getFullYear()
    if (age >= 20 && age <= 30) ageGroups['20-30']++
    else if (age >= 31 && age <= 40) ageGroups['31-40']++
    else if (age >= 41 && age <= 50) ageGroups['41-50']++
    else if (age > 50) ageGroups['50+']++
  })

  const chartUsiaPegawai = Object.entries(ageGroups).map(([name, value]) => ({
    name,
    value
  }))

  // 7. TREND BULANAN WBP (LINE CHART)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  
  const wbpTahunIni = await db.wargaBinaan.findMany({
    where: {
      OR: [
        { tanggalMasuk: { gte: new Date(`${currentYear}-01-01`) } },
        { tanggalBebas: { gte: new Date(`${currentYear}-01-01`), not: null } }
      ]
    },
    select: { tanggalMasuk: true, tanggalBebas: true }
  })

  const chartTrend = months.map((bulan, index) => {
    const masuk = wbpTahunIni.filter(w =>
      new Date(w.tanggalMasuk).getMonth() === index &&
      new Date(w.tanggalMasuk).getFullYear() === currentYear
    ).length

    const keluar = wbpTahunIni.filter(w =>
      w.tanggalBebas &&
      new Date(w.tanggalBebas).getMonth() === index &&
      new Date(w.tanggalBebas).getFullYear() === currentYear
    ).length

    return { bulan, masuk, keluar }
  })

  return (
    <DashboardView
      stats={{ totalPegawai, totalWBP, agendaHariIni, totalPerkara }}
      chartGolongan={chartGolongan}
      chartPerkara={chartPerkara}
      chartStatusWBP={chartStatusWBP}
      chartJenisKelamin={chartJenisKelamin} // ✅ REAL DATA
      chartUsiaPegawai={chartUsiaPegawai}   // ✅ REAL DATA
      chartTrend={chartTrend}
    />
  )
}