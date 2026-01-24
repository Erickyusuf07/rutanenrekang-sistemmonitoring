import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createLog } from "@/actions/system-log"
import { LogType } from "@prisma/client"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ AWAIT params (Next.js 15)
    const { id } = await params

    // Cek apakah agenda ada
    const agenda = await db.agendaKarutan.findUnique({
      where: { id }
    })

    if (!agenda) {
      return NextResponse.json(
        { error: "Agenda tidak ditemukan!" },
        { status: 404 }
      )
    }

    // Hapus agenda
    await db.agendaKarutan.delete({
      where: { id }
    })
    await createLog(
      `Menghapus agenda: ${agenda.judul}`,
      LogType.DELETE,
    )
    return NextResponse.json({
      success: true,
      message: "Agenda berhasil dihapus!"
    })
  } catch (error) {
    console.error("Delete agenda error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus agenda!" },
      { status: 500 }
    )
  }
}