export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getDisplayData } from "@/actions/display"
import DisplayContent from "@/components/display/display-content"
import { redirect } from "next/navigation"


export const metadata = {
  title: "Display TV | RUTAN Enrekang",
  description: "Monitoring System RUTAN Enrekang"
}

export default async function PublicDisplayPage() {
  const data = await getDisplayData()

  // ✅ Redirect ke login jika private dan belum login
  if (!data.success && data.error?.includes("login")) {
    redirect("/")
  }

  return (
    <div className="w-full">
      <DisplayContent initialData={data} />
    </div>
  )
}