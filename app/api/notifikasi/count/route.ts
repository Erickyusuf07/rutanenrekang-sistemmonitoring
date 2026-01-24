import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const today = new Date()
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    // ✅ PARALEL FETCH untuk performa
    const [pegawaiList, wbpCount] = await Promise.all([
      // Hitung pegawai yang perlu perhatian (jatuh tempo dalam 30 hari atau sudah lewat)
      db.pegawai.findMany({
        where: {
          status: "AKTIF"
        },
        select: {
          jadwalNaikPangkat: true,
          jadwalKenaikanGaji: true,
        },
      }),

      // ✅ FIX: Hitung WBP yang akan bebas dalam 30 hari (query langsung dengan count)
      db.wargaBinaan.count({
        where: {
          status: "AKTIF",
          tanggalBebas: {
            not: null,
            gte: today, // Belum bebas
            lte: next30Days // Dalam 30 hari
          }
        }
      })
    ])

    // ✅ COUNT PEGAWAI (yang perlu perhatian)
    let pegawaiCount = 0
    const countedIds = new Set<string>()

    pegawaiList.forEach((p, index) => {
      const id = `pegawai-${index}`
      
      // Cek Pangkat (jatuh tempo dalam 30 hari atau sudah lewat)
      const diffPangkat = Math.floor(
        (new Date(p.jadwalNaikPangkat).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      // Cek Gaji (jatuh tempo dalam 30 hari atau sudah lewat)
      const diffGaji = Math.floor(
        (new Date(p.jadwalKenaikanGaji).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Count jika ada yang perlu perhatian
      if (diffPangkat < 30 || diffGaji < 30) {
        if (!countedIds.has(id)) {
          pegawaiCount++
          countedIds.add(id)
        }
      }
    })

    // ✅ TOTAL COUNT = PEGAWAI + WBP
    const totalCount = pegawaiCount + wbpCount

    return NextResponse.json({ 
      count: totalCount,
      detail: {
        pegawai: pegawaiCount,
        wbp: wbpCount
      }
    })
  } catch (error) {
    console.error('Error fetching notification count:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}