// app/dashboard/agenda/[id]/edit/page.tsx
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import EditAgendaForm from "./edit-form" // Kita akan buat file ini terpisah agar rapi

interface PageProps {
  params: Promise<{ id: string }> // Update untuk Next.js 15+ (params harus di-await)
}

export default async function EditAgendaPage({ params }: PageProps) {
  // 1. Ambil ID dari URL
  const { id } = await params

  // 2. Ambil Data Lama dari Database
  const agenda = await db.agendaKarutan.findUnique({
    where: { id }
  })

  // 3. Jika data tidak ditemukan, tampilkan 404
  if (!agenda) {
    notFound()
  }

  // 4. Kirim data ke Form Client Component
  return (
    <div className="max-w-3xl mx-auto pb-20">
       <EditAgendaForm agenda={agenda} />
    </div>
  )
}