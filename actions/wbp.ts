"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { JenisKelamin, Agama, JenisPidana, StatusPenahanan, StatusWBP } from "@prisma/client"
import { createLog } from "./system-log"
export type WBPState = {
  error?: string
  message?: string
} | null
// ✅ Helper function: Compute dates
function computeDates(tanggalMasuk: Date, tanggalVonis: Date | null, vonisHukuman: number | null) {
  const jadwalSelesaiMapenaling = new Date(tanggalMasuk)
  jadwalSelesaiMapenaling.setDate(jadwalSelesaiMapenaling.getDate() + 14)

  let tanggalBebas: Date | null = null
  
  // Hanya compute jika PIDANA (ada vonis)
  if (tanggalVonis && vonisHukuman && !isNaN(vonisHukuman)) {
    tanggalBebas = new Date(tanggalVonis)
    tanggalBebas.setMonth(tanggalBebas.getMonth() + vonisHukuman)
  }

  return { jadwalSelesaiMapenaling, tanggalBebas }
}

// ========================================
// CREATE WBP
// ========================================
export async function createWBP(prevState: unknown, formData: FormData) {
  try {
    const noRegistrasi = formData.get("noRegistrasi") as string
    const nik = formData.get("nik") as string
    const jenisPidana = formData.get("jenisPidana") as JenisPidana

    // ✅ VALIDASI: No. Registrasi unik
    const existingReg = await db.wargaBinaan.findUnique({ where: { noRegistrasi } })
    if (existingReg) return { error: `No. Registrasi ${noRegistrasi} sudah terdaftar!` }

    // ✅ VALIDASI: NIK unik
    const existingNIK = await db.wargaBinaan.findUnique({ where: { nik } })
    if (existingNIK) return { error: `NIK ${nik} sudah terdaftar!` }

    // ✅ VALIDASI: NIK 16 digit
    if (nik.length !== 16) return { error: "NIK harus 16 digit!" }

    // ✅ AMBIL DATA DARI FORM
    const vonisHukumanStr = formData.get("vonisHukuman") as string
    const tanggalVonisStr = formData.get("tanggalVonis") as string
    const tanggalBebasStr = formData.get("tanggalBebas") as string

    // ✅ PARSE DATA (nullable untuk TAHANAN)
    const vonisHukuman = vonisHukumanStr && vonisHukumanStr !== "" ? parseInt(vonisHukumanStr) : null
    const tanggalVonis = tanggalVonisStr && tanggalVonisStr !== "" ? new Date(tanggalVonisStr) : null
    const tanggalMasuk = new Date(formData.get("tanggalMasuk") as string)

    // ✅ COMPUTE DATES
    const computed = computeDates(tanggalMasuk, tanggalVonis, vonisHukuman)

    // ✅ TENTUKAN TANGGAL BEBAS FINAL
    let finalTanggalBebas: Date | null = null

    if (jenisPidana === "TAHANAN") {
      // TAHANAN: Pakai input manual (optional) atau NULL
      if (tanggalBebasStr && tanggalBebasStr !== "") {
        finalTanggalBebas = new Date(tanggalBebasStr)
      } else {
        finalTanggalBebas = null // ✅ NULL = belum ada vonis
      }
    } else {
      // PIDANA: Wajib ada computed tanggal bebas
      if (computed.tanggalBebas) {
        finalTanggalBebas = computed.tanggalBebas
      } else {
        return { error: "Tanggal bebas tidak bisa dihitung. Periksa input Vonis!" }
      }
    }

    // ✅ VALIDASI KHUSUS PIDANA
    if (jenisPidana === "PIDANA") {
      if (!vonisHukuman || vonisHukuman <= 0) {
        return { error: "Vonis hukuman wajib diisi untuk PIDANA!" }
      }
      if (!tanggalVonis) {
        return { error: "Tanggal vonis wajib diisi untuk PIDANA!" }
      }
    }

    // ✅ PREPARE DATA
    const data = {
      noRegistrasi,
      nik,
      nama: formData.get("nama") as string,
      jenisKelamin: formData.get("jenisKelamin") as JenisKelamin,
      tempatLahir: formData.get("tempatLahir") as string,
      tanggalLahir: new Date(formData.get("tanggalLahir") as string),
      agama: formData.get("agama") as Agama,
      pendidikan: formData.get("pendidikan") as string || null,
      pekerjaan: formData.get("pekerjaan") as string || null,
      alamat: formData.get("alamat") as string,
      namaKeluarga: formData.get("namaKeluarga") as string || null,
      noTeleponKeluarga: formData.get("noTeleponKeluarga") as string || null,
      perkara: formData.get("perkara") as string,
      jenisPidana,
      vonisHukuman: vonisHukuman || 0,
      tanggalVonis: tanggalVonis, // ✅ NULL jika TAHANAN
      namaPengacara: formData.get("namaPengacara") as string || null,
      tanggalMasuk,
      jadwalSelesaiMapenaling: computed.jadwalSelesaiMapenaling,
      tanggalBebas: finalTanggalBebas, // ✅ NULL jika TAHANAN
      statusPenahanan: formData.get("statusPenahanan") as StatusPenahanan,
      status: "AKTIF" as StatusWBP,
      catatanKhusus: formData.get("catatanKhusus") as string || null,
    }

    // ✅ SIMPAN KE DATABASE
    const wbp = await db.wargaBinaan.create({ data })
    await createLog(
      `Menambahkan WBP baru: ${wbp.nama} (${wbp.noRegistrasi})`,
      "CREATE",
      JSON.stringify({ noReg: wbp.noRegistrasi, nik: wbp.nik })
    )
    revalidatePath("/dashboard/wbp")
    return { success: true }
  } catch (error) {
    console.error("Error creating WBP:", error)
    return { error: "Gagal menyimpan data. Periksa kembali input Anda." }
  }
}

// ========================================
// UPDATE WBP
// ========================================
export async function updateWBP(prevState: unknown, formData: FormData) {
  try {
    const id = formData.get("id") as string
    const noRegistrasi = formData.get("noRegistrasi") as string
    const nik = formData.get("nik") as string
    const jenisPidana = formData.get("jenisPidana") as JenisPidana

    // ✅ VALIDASI: No. Registrasi unik (exclude current ID)
    const existingReg = await db.wargaBinaan.findUnique({ where: { noRegistrasi } })
    if (existingReg && existingReg.id !== id) {
      return { error: `No. Registrasi ${noRegistrasi} sudah digunakan WBP lain!` }
    }

    // ✅ VALIDASI: NIK unik (exclude current ID)
    const existingNIK = await db.wargaBinaan.findUnique({ where: { nik } })
    if (existingNIK && existingNIK.id !== id) {
      return { error: `NIK ${nik} sudah digunakan WBP lain!` }
    }

    // ✅ VALIDASI: NIK 16 digit
    if (nik.length !== 16) {
      return { error: "NIK harus 16 digit!" }
    }

    // ✅ PARSE DATA
    const vonisHukumanStr = formData.get("vonisHukuman") as string
    const tanggalVonisStr = formData.get("tanggalVonis") as string
    const tanggalBebasStr = formData.get("tanggalBebas") as string

    const vonisHukuman = vonisHukumanStr && vonisHukumanStr !== "" ? parseInt(vonisHukumanStr) : null
    const tanggalVonis = tanggalVonisStr && tanggalVonisStr !== "" ? new Date(tanggalVonisStr) : null
    const tanggalMasuk = new Date(formData.get("tanggalMasuk") as string)

    // ✅ COMPUTE DATES
    const jadwalSelesaiMapenaling = new Date(formData.get("jadwalSelesaiMapenaling") as string)

    // ✅ TENTUKAN TANGGAL BEBAS
    let finalTanggalBebas: Date | null = null

    if (jenisPidana === "TAHANAN") {
      if (tanggalBebasStr && tanggalBebasStr !== "") {
        finalTanggalBebas = new Date(tanggalBebasStr)
      } else {
        finalTanggalBebas = null
      }
    } else {
      // PIDANA: compute dari vonis
      if (tanggalVonis && vonisHukuman) {
        const bebasDate = new Date(tanggalVonis)
        bebasDate.setMonth(bebasDate.getMonth() + vonisHukuman)
        finalTanggalBebas = bebasDate
      } else if (tanggalBebasStr && tanggalBebasStr !== "") {
        finalTanggalBebas = new Date(tanggalBebasStr)
      } else {
        return { error: "Tanggal bebas tidak bisa dihitung. Periksa input Vonis!" }
      }
    }

    // ✅ VALIDASI KHUSUS PIDANA
    if (jenisPidana === "PIDANA") {
      if (!vonisHukuman || vonisHukuman <= 0) {
        return { error: "Vonis hukuman wajib diisi untuk PIDANA!" }
      }
      if (!tanggalVonis) {
        return { error: "Tanggal vonis wajib diisi untuk PIDANA!" }
      }
    }

    // ✅ PREPARE UPDATE DATA
    const data = {
      noRegistrasi,
      nik,
      nama: formData.get("nama") as string,
      jenisKelamin: formData.get("jenisKelamin") as JenisKelamin,
      tempatLahir: formData.get("tempatLahir") as string || null,
      tanggalLahir: new Date(formData.get("tanggalLahir") as string),
      agama: formData.get("agama") as Agama,
      pendidikan: formData.get("pendidikan") as string || null,
      pekerjaan: formData.get("pekerjaan") as string || null,
      alamat: formData.get("alamat") as string || null,
      namaKeluarga: formData.get("namaKeluarga") as string || null,
      noTeleponKeluarga: formData.get("noTeleponKeluarga") as string || null,
      perkara: formData.get("perkara") as string,
      jenisPidana,
      vonisHukuman: vonisHukuman || 0,
      tanggalVonis: tanggalVonis,
      namaPengacara: formData.get("namaPengacara") as string || null,
      tanggalMasuk,
      jadwalSelesaiMapenaling,
      tanggalBebas: finalTanggalBebas,
      statusPenahanan: formData.get("statusPenahanan") as StatusPenahanan,
      catatanKhusus: formData.get("catatanKhusus") as string || null,
    }

    // ✅ UPDATE DATABASE
    const wbp = await db.wargaBinaan.update({
      where: { id },
      data
    })

    await createLog(
      `Mengubah data WBP: ${wbp.nama} (${wbp.noRegistrasi})`,
      "UPDATE",
      JSON.stringify({ noReg: wbp.noRegistrasi })
    )

    revalidatePath("/dashboard/wbp")
    return { success: true }
  } catch (error) {
    console.error("Error updating WBP:", error)
    return { error: "Gagal memperbarui data. Periksa kembali input Anda." }
  }
}
// ========================================
// DELETE WBP (FIX: Tidak return value)
// ========================================
export async function deleteWBP(id: string) {
  try {
     const wbp = await db.wargaBinaan.findUnique({
      where: { id },
      select: { nama: true, noRegistrasi: true }
    })

    await db.wargaBinaan.delete({ where: { id } })

    // ✅ TAMBAHKAN LOG (LINE 222-227)
    if (wbp) {
      await createLog(
        `Menghapus WBP: ${wbp.nama} (${wbp.noRegistrasi})`,
        "DELETE"
      )
    }
    revalidatePath("/dashboard/wbp")
  } catch (err) {
    console.error("❌ Error delete WBP:", err)
    throw new Error("Gagal menghapus data!")
  }
}