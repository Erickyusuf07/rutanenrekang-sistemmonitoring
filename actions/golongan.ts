'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createLog } from "./system-log"
// CREATE
export async function createGolongan(prevState: unknown, formData: FormData) {
  try {
    const kode = formData.get('kode') as string
    const nama = formData.get('nama') as string

    if (!kode || !nama) {
      return { error: "❌ Semua field wajib diisi!" }
    }

    // Cek duplikat kode
    const existing = await db.golongan.findUnique({
      where: { kode }
    })

    if (existing) {
      return { error: `❌ Golongan dengan kode "${kode}" sudah ada!` }
    }

    const golongan = await db.golongan.create({
      data: { kode, nama }
    })

    await createLog(
      `Menambahkan golongan baru: ${golongan.nama}`,
      "CREATE",
    )

    revalidatePath('/dashboard/golongan')
    return { success: "✅ Golongan berhasil ditambahkan!" }
  } catch (error) {
    console.error('Create golongan error:', error)
    return { error: "❌ Gagal menyimpan data golongan!" }
  }
}

// UPDATE
export async function updateGolongan(prevState: unknown, formData: FormData) {
  try {
    const id = formData.get('id') as string
    const kode = formData.get('kode') as string
    const nama = formData.get('nama') as string

    if (!id || !kode || !nama) {
      return { error: "❌ Data tidak lengkap!" }
    }

    // Cek duplikat kode (kecuali ID sendiri)
    const existing = await db.golongan.findFirst({
      where: { 
        kode,
        NOT: { id }
      }
    })

    if (existing) {
      return { error: `❌ Golongan dengan kode "${kode}" sudah ada!` }
    }

    const golongan = await db.golongan.update({
      where: { id },
      data: { kode, nama }
    })
    await createLog(
      `Mengubah golongan: ${golongan.nama} (${golongan.kode})`,
      "UPDATE"
    )
    revalidatePath('/dashboard/golongan')
    return { success: "✅ Golongan berhasil diperbarui!" }
  } catch (error) {
    console.error('Update golongan error:', error)
    return { error: "❌ Gagal memperbarui data golongan!" }
  }
}

// DELETE (DENGAN VALIDASI RELASI)
export async function deleteGolongan(id: string) {
  try {
    // ✅ PERBAIKAN: Pakai golonganId (bukan golongan) karena sekarang pakai relasi
    const golongan = await db.golongan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pegawai: true } // Hitung pegawai yang pakai golongan ini
        }
      }
    })

    if (!golongan) {
      return { error: "❌ Golongan tidak ditemukan!" }
    }

    // Validasi: Cek apakah ada pegawai yang pakai golongan ini
    if (golongan._count.pegawai > 0) {
      return { 
        error: `TIDAK BISA DIHAPUS!\n\nGolongan "${golongan.nama}" (${golongan.kode}) sedang digunakan oleh ${golongan._count.pegawai} pegawai.\n\n Solusi:\n1. Ubah golongan pegawai tersebut terlebih dahulu\n2. Atau nonaktifkan pegawai terkait` 
      }
    }

    // Jika tidak dipakai, hapus
    await db.golongan.delete({
      where: { id }
    })
    await createLog(
      `Menghapus golongan: ${golongan.nama} (${golongan.kode})`,
      "DELETE"
    )
    revalidatePath('/dashboard/golongan')
    return { success: `Golongan "${golongan.nama}" (${golongan.kode}) berhasil dihapus!` }
  } catch (error) {
    console.error('Delete golongan error:', error)
    
    // ✅ PERBAIKAN: Ganti 'any' dengan proper type checking
    // Tangkap error foreign key constraint dari database
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return { error: "Tidak bisa dihapus! Data ini sedang digunakan." }
    }
    
    return { error: "Gagal menghapus data golongan!" }
  }
}