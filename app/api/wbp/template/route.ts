import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function GET() {
  try {
    // ✅ TEMPLATE DATA DENGAN CONTOH
    const templateData = [
      {
        "No. Registrasi": "WBP-2026-001",
        "NIK": "7301012001010001",
        "Nama Lengkap": "Ahmad Rifai",
        "Jenis Kelamin": "Laki-laki",
        "Tempat Lahir": "Enrekang",
        "Tanggal Lahir": "2001-01-01",
        "Agama": "ISLAM",
        "Pendidikan": "SMA",
        "Pekerjaan": "Wiraswasta",
        "Alamat": "Jl. Pattimura No. 15, Enrekang",
        "Nama Keluarga": "Siti Aminah",
        "No. Telepon Keluarga": "081234567890",
        "Perkara": "Pencurian (Pasal 362 KUHP)",
        "Jenis Pidana": "PIDANA",
        "Vonis (Bulan)": 12,
        "Tanggal Vonis": "2025-06-01",
        "Nama Pengacara": "H. Ahmad Yani, S.H.",
        "Tanggal Masuk": "2025-01-01",
        "Selesai Mapenaling": "2025-01-15",
        "Tanggal Bebas": "2026-06-01",
        "Status Penahanan": "NORMAL",
        "Catatan Khusus": "Kooperatif, mengikuti program pembinaan"
      },
      {
        "No. Registrasi": "WBP-2026-002",
        "NIK": "7301012002020002",
        "Nama Lengkap": "Budi Santoso",
        "Jenis Kelamin": "Laki-laki",
        "Tempat Lahir": "Makassar",
        "Tanggal Lahir": "1995-05-15",
        "Agama": "KRISTEN",
        "Pendidikan": "S1",
        "Pekerjaan": "Pegawai Swasta",
        "Alamat": "Jl. Veteran No. 20, Enrekang",
        "Nama Keluarga": "Maria Santoso",
        "No. Telepon Keluarga": "082345678901",
        "Perkara": "Penggelapan (Pasal 372 KUHP)",
        "Jenis Pidana": "TAHANAN",
        "Vonis (Bulan)": "",
        "Tanggal Vonis": "",
        "Nama Pengacara": "Drs. Budi Hartono, S.H., M.H.",
        "Tanggal Masuk": "2025-12-01",
        "Selesai Mapenaling": "2025-12-15",
        "Tanggal Bebas": "",
        "Status Penahanan": "MAPENALING",
        "Catatan Khusus": "Menunggu putusan pengadilan"
      }
    ]

    // ✅ BUAT WORKBOOK
    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template WBP")

    // ✅ STYLING HEADER
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1"
      if (!worksheet[address]) continue
      worksheet[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" }
      }
    }

    // ✅ AUTO WIDTH
    const maxWidth = templateData.reduce((acc, row) => {
      Object.keys(row).forEach((key, i) => {
        const cellLength = String(row[key as keyof typeof row] || "").length
        acc[i] = Math.max(acc[i] || 10, cellLength + 2, key.length + 2)
      })
      return acc
    }, [] as number[])

    worksheet["!cols"] = maxWidth.map(w => ({ width: Math.min(w, 50) }))

    // ✅ ADD INSTRUCTIONS SHEET
    const instructions = [
      { "Field": "No. Registrasi", "Keterangan": "Nomor registrasi unik WBP (contoh: WBP-2026-001)", "Wajib": "Ya" },
      { "Field": "NIK", "Keterangan": "Nomor Induk Kependudukan 16 digit", "Wajib": "Ya" },
      { "Field": "Nama Lengkap", "Keterangan": "Nama lengkap WBP", "Wajib": "Ya" },
      { "Field": "Jenis Kelamin", "Keterangan": "Laki-laki atau Perempuan", "Wajib": "Ya" },
      { "Field": "Tanggal Lahir", "Keterangan": "Format: YYYY-MM-DD (contoh: 2001-01-01)", "Wajib": "Ya" },
      { "Field": "Agama", "Keterangan": "ISLAM, KRISTEN, KATOLIK, HINDU, BUDDHA, KONGHUCU", "Wajib": "Ya" },
      { "Field": "Perkara", "Keterangan": "Jenis perkara/tindak pidana", "Wajib": "Ya" },
      { "Field": "Jenis Pidana", "Keterangan": "PIDANA, TAHANAN, atau KURUNGAN", "Wajib": "Ya" },
      { "Field": "Vonis (Bulan)", "Keterangan": "Lama hukuman dalam bulan (kosong untuk TAHANAN)", "Wajib": "Tidak" },
      { "Field": "Tanggal Vonis", "Keterangan": "Format: YYYY-MM-DD (kosong untuk TAHANAN)", "Wajib": "Tidak" },
      { "Field": "Tanggal Masuk", "Keterangan": "Tanggal masuk Rutan, Format: YYYY-MM-DD", "Wajib": "Ya" },
      { "Field": "Selesai Mapenaling", "Keterangan": "Tanggal selesai masa penelitian (Tanggal Masuk + 14 hari)", "Wajib": "Ya" },
      { "Field": "Tanggal Bebas", "Keterangan": "Tanggal bebas (auto-calculate untuk PIDANA)", "Wajib": "Tidak" },
      { "Field": "Status Penahanan", "Keterangan": "MAPENALING, NORMAL, ISOLASI, atau KARANTINA", "Wajib": "Ya" }
    ]

    const instructionsWS = XLSX.utils.json_to_sheet(instructions)
    XLSX.utils.book_append_sheet(workbook, instructionsWS, "Petunjuk")

    // ✅ CONVERT TO BUFFER
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // ✅ RETURN FILE
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Template_Import_WBP.xlsx"
      }
    })
  } catch (error) {
    console.error("Template generation error:", error)
    return NextResponse.json(
      { error: "Gagal generate template" },
      { status: 500 }
    )
  }
}