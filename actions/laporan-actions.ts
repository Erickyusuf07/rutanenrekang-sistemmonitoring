'use server'

import { db } from "@/lib/db"
import { generatePDF } from "@/lib/pdf-generator"
import { StatusAktif, StatusWBP, StatusPenahanan } from "@prisma/client"

interface LaporanParams {
  jenis: string
  filterMode: 'bulan' | 'tahun' | 'custom'
  bulanMulai: number
  bulanSelesai: number
  tahunMulai: number
  tahunSelesai: number
  status: string
}

export async function generateLaporanPDF(params: LaporanParams) {
  try {
    const { jenis } = params

    switch (jenis) {
      // PEGAWAI
      case 'pegawai-daftar':
        return await laporanPegawaiDaftar(params)
      case 'pegawai-pangkat':
        return await laporanPegawaiPangkat(params)
      case 'pegawai-gaji':
        return await laporanPegawaiGaji(params)
      case 'pegawai-golongan':
        return await laporanPegawaiGolongan(params)
      
      // WBP
      case 'wbp-daftar':
        return await laporanWBPDaftar(params)
      case 'wbp-bebas':
        return await laporanWBPBebas(params)
      case 'wbp-mapenaling':
        return await laporanWBPMapenaling(params)
      case 'wbp-perkara':
        return await laporanWBPPerkara(params)
      
      // REKAPITULASI
      case 'rekap-pegawai':
        return await laporanRekapPegawai(params)
      case 'rekap-wbp':
        return await laporanRekapWBP(params)
      case 'rekap-gabungan':
        return await laporanRekapGabungan(params)
      
      default:
        return { success: false, error: 'Jenis laporan tidak valid', pdfUrl: '', fileName: '' }
    }
  } catch (error) {
    console.error('Error generate laporan:', error)
    return { success: false, error: 'Gagal generate laporan', pdfUrl: '', fileName: '' }
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function getDateRange(params: LaporanParams) {
  const { filterMode, bulanMulai, bulanSelesai, tahunMulai, tahunSelesai } = params

  let startDate: Date
  let endDate: Date

  if (filterMode === 'bulan') {
    startDate = new Date(tahunMulai, bulanMulai - 1, 1)
    endDate = new Date(tahunMulai, bulanMulai, 0, 23, 59, 59)
  } else if (filterMode === 'tahun') {
    startDate = new Date(tahunMulai, 0, 1)
    endDate = new Date(tahunMulai, 11, 31, 23, 59, 59)
  } else {
    startDate = new Date(tahunMulai, bulanMulai - 1, 1)
    endDate = new Date(tahunSelesai, bulanSelesai, 0, 23, 59, 59)
  }

  return { startDate, endDate }
}

function getPeriodeText(params: LaporanParams) {
  const { filterMode, bulanMulai, bulanSelesai, tahunMulai, tahunSelesai } = params

  if (filterMode === 'bulan') {
    return `${new Date(2000, bulanMulai - 1).toLocaleString('id-ID', { month: 'long' })} ${tahunMulai}`
  } else if (filterMode === 'tahun') {
    return `Tahun ${tahunMulai}`
  } else {
    return `${new Date(2000, bulanMulai - 1).toLocaleString('id-ID', { month: 'short' })} ${tahunMulai} - ${new Date(2000, bulanSelesai - 1).toLocaleString('id-ID', { month: 'short' })} ${tahunSelesai}`
  }
}

// ========================================
// LAPORAN PEGAWAI
// ========================================

async function laporanPegawaiDaftar(params: LaporanParams) {
  const { status } = params
  const whereClause = status === 'SEMUA' ? {} : { status: status as StatusAktif }
  
  const data = await db.pegawai.findMany({
    where: whereClause,
    include: { golongan: true },
    orderBy: { nama: 'asc' }
  })

  const pdfBuffer = await generatePDF({
    jenis: 'pegawai-daftar',
    title: 'Laporan Daftar Pegawai',
    data,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Laporan-Pegawai-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}

async function laporanPegawaiPangkat(params: LaporanParams) {
  const { startDate, endDate } = getDateRange(params)

  const data = await db.pegawai.findMany({
    where: {
      status: 'AKTIF',
      jadwalNaikPangkat: { gte: startDate, lte: endDate }
    },
    include: { golongan: true },
    orderBy: { jadwalNaikPangkat: 'asc' }
  })

  const pdfBuffer = await generatePDF({
    jenis: 'pegawai-pangkat',
    title: 'Laporan Kenaikan Pangkat',
    data,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Laporan-Kenaikan-Pangkat-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}

async function laporanPegawaiGaji(params: LaporanParams) {
  const { startDate, endDate } = getDateRange(params)

  const data = await db.pegawai.findMany({
    where: {
      status: 'AKTIF',
      jadwalKenaikanGaji: { gte: startDate, lte: endDate }
    },
    include: { golongan: true },
    orderBy: { jadwalKenaikanGaji: 'asc' }
  })

  const pdfBuffer = await generatePDF({
    jenis: 'pegawai-gaji',
    title: 'Laporan Kenaikan Gaji Berkala',
    data,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Laporan-Kenaikan-Gaji-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}

async function laporanPegawaiGolongan(params: LaporanParams) {
  const { status } = params
  const whereClause = status === 'SEMUA' ? {} : { status: status as StatusAktif }
  
  const data = await db.pegawai.groupBy({
    by: ['golonganId'],
    where: whereClause,
    _count: true
  })

  const golonganData = await db.golongan.findMany()
  
  const result = data.map(item => {
    const golongan = golonganData.find(g => g.id === item.golonganId)
    return {
      golongan: golongan?.nama || '-',
      kode: golongan?.kode || '-',
      jumlah: item._count
    }
  })

  const pdfBuffer = await generatePDF({
    jenis: 'pegawai-golongan',
    title: 'Laporan Pegawai per Golongan',
    data: result,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Laporan-Pegawai-Golongan-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}

// ========================================
// LAPORAN WBP
// ========================================

async function laporanWBPDaftar(params: LaporanParams) {
  const { status } = params
  const whereClause = status === 'SEMUA' ? {} : { status: status as StatusWBP }
  
  const data = await db.wargaBinaan.findMany({
    where: whereClause,
    orderBy: { nama: 'asc' }
  })

  const pdfBuffer = await generatePDF({
    jenis: 'wbp-daftar',
    title: 'Laporan Daftar Warga Binaan Pemasyarakatan',
    data,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Laporan-WBP-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}

async function laporanWBPBebas(params: LaporanParams) {
  const { startDate, endDate } = getDateRange(params)

  const data = await db.wargaBinaan.findMany({
    where: {
      status: 'AKTIF',
      tanggalBebas: { 
        gte: startDate, 
        lte: endDate 
      }
    },
    orderBy: { tanggalBebas: 'asc' }
  })

  const pdfBuffer = await generatePDF({
    jenis: 'wbp-bebas',
    title: 'Laporan Jadwal Pembebasan WBP',
    data,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Laporan-WBP-Bebas-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}

async function laporanWBPMapenaling(params: LaporanParams) {
  const { status } = params
  
  const whereClause = status === 'SEMUA' 
    ? { 
        statusPenahanan: StatusPenahanan.MAPENALING
      } 
    : { 
        status: status as StatusWBP,
        statusPenahanan: StatusPenahanan.MAPENALING
      }
  
  const data = await db.wargaBinaan.findMany({
    where: whereClause,
    orderBy: { nama: 'asc' }
  })

  const pdfBuffer = await generatePDF({
    jenis: 'wbp-mapenaling',
    title: 'Laporan Status Mapenaling WBP',
    data,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Laporan-WBP-Mapenaling-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}

async function laporanWBPPerkara(params: LaporanParams) {
  const { status } = params
  const whereClause = status === 'SEMUA' ? {} : { status: status as StatusWBP }
  
  const data = await db.wargaBinaan.groupBy({
    by: ['perkara'],
    where: whereClause,
    _count: true
  })

  const result = data.map(item => ({
    jenisPerkara: item.perkara || '-',
    jumlah: item._count
  }))

  const pdfBuffer = await generatePDF({
    jenis: 'wbp-perkara',
    title: 'Laporan WBP per Jenis Perkara',
    data: result,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Laporan-WBP-Perkara-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}

// ========================================
// REKAPITULASI
// ========================================

async function laporanRekapPegawai(params: LaporanParams) {
  const { status } = params
  const whereClause = status === 'SEMUA' ? {} : { status: status as StatusAktif }
  
  const totalPegawai = await db.pegawai.count({ where: whereClause })
  const perGolongan = await db.pegawai.groupBy({
    by: ['golonganId'],
    where: whereClause,
    _count: true
  })

  const golonganData = await db.golongan.findMany()
  
  const result = {
    total: totalPegawai,
    detail: perGolongan.map(item => {
      const golongan = golonganData.find(g => g.id === item.golonganId)
      return {
        golongan: golongan?.nama || '-',
        kode: golongan?.kode || '-',
        jumlah: item._count
      }
    })
  }

  const pdfBuffer = await generatePDF({
    jenis: 'rekap-pegawai',
    title: 'Rekapitulasi Data Pegawai',
    data: result,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Rekapitulasi-Pegawai-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}

async function laporanRekapWBP(params: LaporanParams) {
  const { status } = params
  const whereClause = status === 'SEMUA' ? {} : { status: status as StatusWBP }
  
  const totalWBP = await db.wargaBinaan.count({ where: whereClause })
  const perPerkara = await db.wargaBinaan.groupBy({
    by: ['perkara'],
    where: whereClause,
    _count: true
  })

  const result = {
    total: totalWBP,
    detail: perPerkara.map(item => ({
      jenisPerkara: item.perkara || '-',
      jumlah: item._count
    }))
  }

  const pdfBuffer = await generatePDF({
    jenis: 'rekap-wbp',
    title: 'Rekapitulasi Data Warga Binaan Pemasyarakatan',
    data: result,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Rekapitulasi-WBP-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}

async function laporanRekapGabungan(params: LaporanParams) {
  const { status } = params
  const whereClausePegawai = status === 'SEMUA' ? {} : { status: status as StatusAktif }
  const whereClauseWBP = status === 'SEMUA' ? {} : { status: status as StatusWBP }
  
  const totalPegawai = await db.pegawai.count({ where: whereClausePegawai })
  const totalWBP = await db.wargaBinaan.count({ where: whereClauseWBP })

  const result = {
    pegawai: totalPegawai,
    wbp: totalWBP,
    total: totalPegawai + totalWBP
  }

  const pdfBuffer = await generatePDF({
    jenis: 'rekap-gabungan',
    title: 'Rekapitulasi Gabungan Pegawai & WBP',
    data: result,
    periode: getPeriodeText(params)
  })

  return {
    success: true,
    pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    fileName: `Rekapitulasi-Gabungan-${new Date().toISOString().split('T')[0]}.pdf`,
    error: ''
  }
}