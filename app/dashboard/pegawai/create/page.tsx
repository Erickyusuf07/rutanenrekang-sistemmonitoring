// app/dashboard/pegawai/create/page.tsx
import { db } from "@/lib/db"
import CreatePegawaiForm from "./create-form"

export default async function CreatePegawaiPage() {
  // 1. Ambil Data Golongan dari Database (Server Side Fetching)
  // Diurutkan berdasarkan kode (II/a, II/b, dst)
  const listGolongan = await db.golongan.findMany({ 
    orderBy: { kode: 'asc' } 
  })

  // 2. Tampilkan Form dan kirim datanya
  return (
    <div className="max-w-3xl mx-auto pb-20">
      <CreatePegawaiForm listGolongan={listGolongan} config={null} />
    </div>
  )
}