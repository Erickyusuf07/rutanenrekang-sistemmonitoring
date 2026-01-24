// app/dashboard/wbp/[id]/edit/page.tsx
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import EditWBPForm from "./edit-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditWBPPage({ params }: PageProps) {
  const { id } = await params

  // Ambil data WBP lama
  const wbp = await db.wargaBinaan.findUnique({
    where: { id }
  })

  if (!wbp) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
       <EditWBPForm wbp={wbp} />
    </div>
  )
}