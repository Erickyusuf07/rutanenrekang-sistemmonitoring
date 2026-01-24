import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import EditPegawaiForm from "./edit-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPegawaiPage({ params }: PageProps) {
  const { id } = await params

  // 1. Ambil data Pegawai
  const pegawai = await db.pegawai.findUnique({ 
    where: { id },
    include: { golongan: true }  // ✅ TAMBAHKAN INI
  })
  
  // 2. Ambil List Golongan
  const listGolongan = await db.golongan.findMany({ orderBy: { kode: 'asc' } })

  // 3. Ambil Config
  const config = await db.konfigurasi.findFirst()

  if (!pegawai) notFound()
  console.log('🔍 Debug Pegawai:', {
    golonganId: pegawai.golonganId,
    golongan: pegawai.golongan,
    listGolongan: listGolongan.map(g => ({ id: g.id, kode: g.kode }))
  })
  return <EditPegawaiForm pegawai={pegawai} listGolongan={listGolongan} config={config} />
}