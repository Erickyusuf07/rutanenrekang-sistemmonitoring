// actions/agenda.ts
'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createLog } from "./system-log"
import { LogType } from "@prisma/client"
// 1. DEFINISI TIPE DATA (SOLUSI EROR LINTING)
// Kita definisikan bentuk state, tidak boleh 'any'
export type AgendaState = {
  error?: string
  message?: string
} | null

// 2. FUNGSI CREATE (SUDAH DIPERBAIKI TIPENYA)
export async function createAgenda(prevState: AgendaState, formData: FormData) {
  const judul = formData.get("judul") as string
  const lokasi = formData.get("lokasi") as string
  const deskripsi = formData.get("deskripsi") as string
  
  const waktuMulaiStr = formData.get("waktuMulai") as string
  const waktuSelesaiStr = formData.get("waktuSelesai") as string

  // Validasi
  if (!judul || !waktuMulaiStr) {
    return { error: "Judul Kegiatan dan Waktu Mulai wajib diisi!" }
  }

  try {
    const agenda = await db.agendaKarutan.create({
      data: {
        judul,
        lokasi: lokasi || "-",
        deskripsi: deskripsi || "",
        waktuMulai: new Date(waktuMulaiStr),
        waktuSelesai: waktuSelesaiStr ? new Date(waktuSelesaiStr) : new Date(waktuMulaiStr),
        isSelesai: false
      }
    })
    await createLog(
      `Menambahkan agenda baru: ${agenda.judul}`,
      "CREATE"
    )
  } catch (err) {
    console.error("Agenda Error:", err)
    return { error: "Gagal menyimpan agenda kegiatan." }
  }

  revalidatePath("/dashboard/agenda")
  redirect("/dashboard/agenda")
}

// 3. FUNGSI UPDATE (FITUR BARU)
export async function updateAgenda(prevState: AgendaState, formData: FormData) {
  const id = formData.get("id") as string // ID diambil dari Hidden Input
  const judul = formData.get("judul") as string
  const lokasi = formData.get("lokasi") as string
  const deskripsi = formData.get("deskripsi") as string
  const waktuMulaiStr = formData.get("waktuMulai") as string
  const waktuSelesaiStr = formData.get("waktuSelesai") as string

  if (!id || !judul || !waktuMulaiStr) {
    return { error: "Data tidak lengkap! ID, Judul, dan Waktu wajib ada." }
  }

  try {
    const agenda =await db.agendaKarutan.update({
      where: { id },
      data: {
        judul,
        lokasi: lokasi || "-",
        deskripsi: deskripsi || "",
        waktuMulai: new Date(waktuMulaiStr),
        waktuSelesai: waktuSelesaiStr ? new Date(waktuSelesaiStr) : new Date(waktuMulaiStr),
      }
    })
    await createLog(
      `Mengubah agenda: ${agenda.judul}`,
      "UPDATE"
    )
  } catch (err) {
    console.error("Update Error:", err)
    return { error: "Gagal memperbarui agenda." }
  }

  revalidatePath("/dashboard/agenda")
  redirect("/dashboard/agenda")
}

// 4. FUNGSI DELETE
export async function deleteAgenda(id: string) {
  try {
    const agenda = await db.agendaKarutan.findUnique({
      where: { id },
      select: { judul: true }
    })
    if (!agenda) {
      console.error("❌ Agenda not found:", id)
      return
    }
    await db.agendaKarutan.delete({ where: { id } })

    await createLog(
      `Menghapus agenda: ${agenda.judul}`,
      LogType.DELETE, // ✅ BUKAN "DELETE" (string)
     
    )
    revalidatePath("/dashboard/agenda")
  } catch (err) {
    console.error("Delete Error:", err)
  }
}