import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get("search") || ""

  try {
    const pegawai = await db.pegawai.findMany({
      where: {
        OR: [
          { nama: { contains: search, mode: "insensitive" } },
          { nip: { contains: search, mode: "insensitive" } },
          { jabatan: { contains: search, mode: "insensitive" } }
        ]
      },
      include: {
        golongan: true  // ✅ PINDAH KE SINI (sejajar dengan where)
      },
      orderBy: { nama: "asc" }
    })

    return NextResponse.json(pegawai)
  } catch (error) {
    console.error("Error fetching pegawai:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}