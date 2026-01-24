'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createLog } from "./system-log"
import { LogType } from "@prisma/client"

export type PengumumanState = {
  error?: string
  message?: string
} | null

// ========================================
// CREATE PENGUMUMAN
// ========================================
export async function createPengumuman(
  prevState: PengumumanState,
  formData: FormData
) {
  try {
    const session = await auth()
    if (!session) {
      return { error: "Unauthorized" }
    }

    const judul = formData.get("judul") as string
    const isi = formData.get("isi") as string
    const tipe = formData.get("tipe") as "INFO" | "WARNING" | "URGENT" | "SUCCESS"
    const isPriority = formData.get("isPriority") === "true"

    if (!judul || !isi) {
      return { error: "Judul dan isi pengumuman wajib diisi!" }
    }

    const pengumuman = await db.pengumuman.create({
      data: {
        judul,
        isi,
        tipe,
        isPriority,
        createdBy: session.user.id
      }
    })

    await createLog(
      `Menambahkan pengumuman: ${pengumuman.judul}`,
      LogType.CREATE,
      JSON.stringify({ tipe, isPriority })
    )

    revalidatePath("/dashboard/pengumuman-display")
    revalidatePath("/display")
    
    return { message: "Pengumuman berhasil ditambahkan!" }
  } catch (error) {
    console.error("Error creating pengumuman:", error)
    return { error: "Gagal menambahkan pengumuman!" }
  }
}

// ========================================
// UPDATE PENGUMUMAN
// ========================================
export async function updatePengumuman(
  prevState: PengumumanState,
  formData: FormData
) {
  try {
    const session = await auth()
    if (!session) {
      return { error: "Unauthorized" }
    }

    const id = formData.get("id") as string
    const judul = formData.get("judul") as string
    const isi = formData.get("isi") as string
    const tipe = formData.get("tipe") as "INFO" | "WARNING" | "URGENT" | "SUCCESS"
    const isPriority = formData.get("isPriority") === "true"
    const isActive = formData.get("isActive") === "true"

    await db.pengumuman.update({
      where: { id },
      data: { judul, isi, tipe, isPriority, isActive }
    })

    await createLog(
      `Mengubah pengumuman: ${judul}`,
      LogType.UPDATE
    )

    revalidatePath("/dashboard/pengumuman-display")
    revalidatePath("/display")
    
    return { message: "Pengumuman berhasil diperbarui!" }
  } catch (error) {
    console.error("Error updating pengumuman:", error)
    return { error: "Gagal memperbarui pengumuman!" }
  }
}

// ========================================
// DELETE PENGUMUMAN
// ========================================
export async function deletePengumuman(id: string) {
  try {
    const session = await auth()
    if (!session) {
      return { error: "Unauthorized" }
    }

    const pengumuman = await db.pengumuman.findUnique({
      where: { id }
    })

    if (!pengumuman) {
      return { error: "Pengumuman tidak ditemukan!" }
    }

    await db.pengumuman.delete({
      where: { id }
    })

    await createLog(
      `Menghapus pengumuman: ${pengumuman.judul}`,
      LogType.DELETE
    )

    revalidatePath("/dashboard/pengumuman-display")
    revalidatePath("/display")
    
    return { message: "Pengumuman berhasil dihapus!" }
  } catch (error) {
    console.error("Error deleting pengumuman:", error)
    return { error: "Gagal menghapus pengumuman!" }
  }
}

// ========================================
// TOGGLE STATUS (AKTIF/NON-AKTIF)
// ========================================
export async function togglePengumumanStatus(id: string) {
  try {
    const session = await auth()
    if (!session) {
      return { error: "Unauthorized" }
    }

    const pengumuman = await db.pengumuman.findUnique({
      where: { id }
    })

    if (!pengumuman) {
      return { error: "Pengumuman tidak ditemukan!" }
    }

    await db.pengumuman.update({
      where: { id },
      data: { isActive: !pengumuman.isActive }
    })

    await createLog(
      `${pengumuman.isActive ? 'Menonaktifkan' : 'Mengaktifkan'} pengumuman: ${pengumuman.judul}`,
      LogType.UPDATE
    )

    revalidatePath("/dashboard/pengumuman-display")
    revalidatePath("/display")
    
    return { message: "Status pengumuman berhasil diubah!" }
  } catch (error) {
    console.error("Error toggling pengumuman status:", error)
    return { error: "Gagal mengubah status!" }
  }
}