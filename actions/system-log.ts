'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { LogType, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

// ✅ HELPER: Get Current Admin (dengan fallback)
async function getCurrentAdmin() {
  try {
    const session = await auth();
    const adminId = session?.user?.id;

    if (!adminId) {
      console.warn("⚠️ No admin session found for logging")
      return null // ✅ RETURN NULL instead of throwing error
    }

    return adminId
  } catch (error) {
    console.error("❌ Error getting admin session:", error)
    return null
  }
}

// ✅ CREATE LOG (Dipanggil setiap kali ada CRUD)
export async function createLog(
  aktivitas: string,
  tipe: LogType,
  detail?: string
) {
  try {
    const adminId = await getCurrentAdmin()
    
    // ✅ SKIP LOG JIKA TIDAK ADA SESSION (misal dari cron job atau import)
    if (!adminId) {
      console.warn("⚠️ Skipping log - no admin session")
      return
    }

    await db.systemLog.create({
      data: {
        adminId,
        aktivitas,
        tipe,
        detail
      }
    })
    
    console.log(`✅ Log created: ${tipe} - ${aktivitas}`)
  } catch (error) {
    console.error("❌ Error create log:", error)
    // ✅ JANGAN THROW ERROR, biar proses utama tetap jalan
  }
}

// ✅ GET ALL LOGS (Dengan Filter)
export async function getLogs(params?: {
  tipe?: LogType
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}) {
  try {
    const { tipe, search, startDate, endDate, page = 1, limit = 20 } = params || {}

    const where: Prisma.SystemLogWhereInput = {}

    if (tipe) {
      where.tipe = tipe
    }

    if (search) {
      where.aktivitas = {
        contains: search,
        mode: 'insensitive'
      }
    }

    if (startDate || endDate) {
      where.waktu = {}
      if (startDate) where.waktu.gte = new Date(startDate)
      if (endDate) where.waktu.lte = new Date(endDate)
    }

    const [logs, total] = await Promise.all([
      db.systemLog.findMany({
        where,
        include: {
          admin: {
            select: {
              namaLengkap: true,
              username: true
            }
          }
        },
        orderBy: { waktu: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.systemLog.count({ where })
    ])

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error("❌ Error get logs:", error)
    return {
      logs: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    }
  }
}

// ✅ GET LOG STATISTICS
export async function getLogStats() {
  try {
    const [total, byType, recent] = await Promise.all([
      db.systemLog.count(),
      db.systemLog.groupBy({
        by: ['tipe'],
        _count: true
      }),
      db.systemLog.findMany({
        take: 5,
        orderBy: { waktu: 'desc' },
        include: {
          admin: {
            select: { namaLengkap: true }
          }
        }
      })
    ])

    return { total, byType, recent }
  } catch (error) {
    console.error("❌ Error get log stats:", error)
    return { total: 0, byType: [], recent: [] }
  }
}

// ✅ DELETE OLD LOGS (Cleanup - Opsional)
export async function deleteOldLogs(daysBefore: number = 90) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBefore)

    const result = await db.systemLog.deleteMany({
      where: {
        waktu: {
          lt: cutoffDate
        }
      }
    })

    // Log the cleanup action
    await createLog(
      `Menghapus ${result.count} log lama (> ${daysBefore} hari)`,
      "DELETE",
      JSON.stringify({ deletedCount: result.count, cutoffDate })
    )

    revalidatePath("/dashboard/history")
    return { success: true, deletedCount: result.count }
  } catch (error) {
    console.error("❌ Error delete old logs:", error)
    return { success: false, error: "Gagal menghapus log lama" }
  }
}