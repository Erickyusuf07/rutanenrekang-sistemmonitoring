export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getDisplayData } from "@/actions/display"
import DisplayContent from "@/components/display/display-content"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata = {
  title: "Preview Display TV | RUTAN Enrekang"
}

export default async function DashboardDisplayPreviewPage() {
  const data = await getDisplayData()

  if (!data.success) {
    redirect("/dashboard/display-settings")
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-slate-100">
      {/* ADMIN NOTICE BANNER */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold">Mode Preview (Admin Only)</span>
        </div>
        <Link
          href="/dashboard/display-settings"
          className="px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-all"
        >
          Kembali ke Pengaturan
        </Link>
      </div>

      {/* DISPLAY CONTENT */}
      <DisplayContent initialData={data} />
    </div>
  )
}