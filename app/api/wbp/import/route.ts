import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as XLSX from "xlsx"
import { JenisKelamin, Agama, JenisPidana, StatusPenahanan, LogType } from "@prisma/client"
import { cookies } from "next/headers"
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan!" }, { status: 400 })
    }
    const cookieStore = await cookies()
    const adminId = cookieStore.get("session_admin")?.value
    // ✅ READ FILE
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    // ✅ VALIDASI & IMPORT
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const [index, row] of jsonData.entries()) {
      try {
        const data = row as Record<string, unknown>

        // ✅ VALIDASI FIELD WAJIB
        const noRegistrasi = String(data["No. Registrasi"] || "").trim()
        const nik = String(data["NIK"] || "").trim()
        const nama = String(data["Nama Lengkap"] || "").trim()
        const perkara = String(data["Perkara"] || "").trim()

        if (!noRegistrasi || !nik || !nama || !perkara) {
          errors.push(`Baris ${index + 2}: Data tidak lengkap`)
          errorCount++
          continue
        }

        // ✅ VALIDASI NIK
        if (nik.length !== 16) {
          errors.push(`Baris ${index + 2}: NIK harus 16 digit`)
          errorCount++
          continue
        }

        // ✅ CEK DUPLIKAT
        const existing = await db.wargaBinaan.findFirst({
          where: {
            OR: [
              { noRegistrasi },
              { nik }
            ]
          }
        })

        if (existing) {
          errors.push(`Baris ${index + 2}: No. Registrasi atau NIK sudah terdaftar`)
          errorCount++
          continue
        }

        // ✅ PARSE DATA
        const jenisKelamin = String(data["Jenis Kelamin"]).toLowerCase().includes("perempuan") 
          ? JenisKelamin.PEREMPUAN 
          : JenisKelamin.LAKI_LAKI

        const jenisPidana = String(data["Jenis Pidana"]).toUpperCase() as JenisPidana
        const statusPenahanan = String(data["Status Penahanan"]).toUpperCase() as StatusPenahanan
        const agama = String(data["Agama"]).toUpperCase() as Agama

        const tanggalMasuk = parseDate(String(data["Tanggal Masuk"]))
        const tanggalLahir = parseDate(String(data["Tanggal Lahir"]))
        const tanggalVonis = data["Tanggal Vonis"] ? parseDate(String(data["Tanggal Vonis"])) : null
        const jadwalMapenaling = parseDate(String(data["Selesai Mapenaling"]))
        const tanggalBebas = data["Tanggal Bebas"] ? parseDate(String(data["Tanggal Bebas"])) : null

        const vonisHukuman = data["Vonis (Bulan)"] ? parseInt(String(data["Vonis (Bulan)"])) : 0

        // ✅ CREATE DATA
        await db.wargaBinaan.create({
          data: {
            noRegistrasi,
            nik,
            nama,
            jenisKelamin,
            tempatLahir: String(data["Tempat Lahir"] || ""),
            tanggalLahir,
            agama,
            pendidikan: String(data["Pendidikan"] || "") || null,
            pekerjaan: String(data["Pekerjaan"] || "") || null,
            alamat: String(data["Alamat"] || "") || null,
            namaKeluarga: String(data["Nama Keluarga"] || "") || null,
            noTeleponKeluarga: String(data["No. Telepon Keluarga"] || "") || null,
            perkara,
            jenisPidana,
            vonisHukuman,
            tanggalVonis,
            namaPengacara: String(data["Nama Pengacara"] || "") || null,
            tanggalMasuk,
            jadwalSelesaiMapenaling: jadwalMapenaling,
            tanggalBebas,
            statusPenahanan,
            catatanKhusus: String(data["Catatan Khusus"] || "") || null,
            status: "AKTIF"
          }
        })

        successCount++
      } catch (err) {
        console.error(`Error row ${index + 2}:`, err)
        errors.push(`Baris ${index + 2}: ${err instanceof Error ? err.message : 'Error tidak diketahui'}`)
        errorCount++
      }
    }
    if (adminId) {
      try {
        await db.systemLog.create({
          data: {
            adminId,
            aktivitas: `Import data WBP: ${successCount} berhasil, ${errorCount} gagal`,
            tipe: LogType.IMPORT,
            detail: JSON.stringify({
              fileName: file.name,
              fileSize: file.size,
              totalRows: jsonData.length,
              successCount,
              errorCount,
              errorSample: errors.slice(0, 3)
            })
          }
        })
        console.log("✅ Import WBP log created successfully")
      } catch (logError) {
        console.error("❌ Error creating import log:", logError)
      }
    } else {
      console.warn("⚠️ No admin session, skipping import log")
    }
    return NextResponse.json({
      success: true,
      message: `Import selesai: ${successCount} berhasil, ${errorCount} gagal`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10) // Tampilkan max 10 error pertama
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: "Gagal import data: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

function parseDate(dateStr: string): Date {
  // Format: YYYY-MM-DD atau DD/MM/YYYY atau Excel serial
  if (!dateStr) return new Date()
  
  // Coba parse as Excel serial number
  const num = parseFloat(dateStr)
  if (!isNaN(num) && num > 40000) { // Excel dates start from 1900
    return XLSX.SSF.parse_date_code(num)
  }
  
  return new Date(dateStr)
}