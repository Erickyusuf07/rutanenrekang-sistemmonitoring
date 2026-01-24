import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as XLSX from "xlsx"

export async function GET() {
  try {
    const wbpList = await db.wargaBinaan.findMany({
      where: { status: "AKTIF" },
      orderBy: { createdAt: "desc" }
    })

    // ✅ FORMAT DATA UNTUK EXCEL
    const excelData = wbpList.map((wbp) => ({
      "No. Registrasi": wbp.noRegistrasi,
      "NIK": wbp.nik,
      "Nama Lengkap": wbp.nama,
      "Jenis Kelamin": wbp.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan",
      "Tempat Lahir": wbp.tempatLahir || "",
      "Tanggal Lahir": wbp.tanggalLahir ? formatDate(wbp.tanggalLahir) : "",
      "Agama": wbp.agama,
      "Pendidikan": wbp.pendidikan || "",
      "Pekerjaan": wbp.pekerjaan || "",
      "Alamat": wbp.alamat || "",
      "Nama Keluarga": wbp.namaKeluarga || "",
      "No. Telepon Keluarga": wbp.noTeleponKeluarga || "",
      "Perkara": wbp.perkara,
      "Jenis Pidana": wbp.jenisPidana,
      "Vonis (Bulan)": wbp.vonisHukuman > 0 ? wbp.vonisHukuman : "",
      "Tanggal Vonis": wbp.tanggalVonis ? formatDate(wbp.tanggalVonis) : "",
      "Nama Pengacara": wbp.namaPengacara || "",
      "Tanggal Masuk": formatDate(wbp.tanggalMasuk),
      "Selesai Mapenaling": formatDate(wbp.jadwalSelesaiMapenaling),
      "Tanggal Bebas": wbp.tanggalBebas ? formatDate(wbp.tanggalBebas) : "",
      "Status Penahanan": wbp.statusPenahanan,
      "Catatan Khusus": wbp.catatanKhusus || ""
    }))

    // ✅ BUAT WORKBOOK
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data WBP")

    // ✅ AUTO WIDTH COLUMNS
    const maxWidth = excelData.reduce((acc, row) => {
      Object.keys(row).forEach((key, i) => {
        const cellLength = String(row[key as keyof typeof row]).length
        acc[i] = Math.max(acc[i] || 10, cellLength + 2)
      })
      return acc
    }, [] as number[])

    worksheet["!cols"] = maxWidth.map(w => ({ width: w }))

    // ✅ CONVERT TO BUFFER
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // ✅ RETURN FILE
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Data_WBP_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Gagal export data" }, { status: 500 })
  }
}

function formatDate(date: Date): string {
  return new Date(date).toISOString().split('T')[0]
}