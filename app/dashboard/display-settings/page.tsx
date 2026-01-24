import { getDisplaySettings } from "@/actions/display"
import DisplaySettingsForm from "./display-settings-form"

export const metadata = {
  title: "Pengaturan Display TV | RUTAN Enrekang"
}

export default async function DisplaySettingsPage() {
  const settings = await getDisplaySettings()

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Pengaturan Display TV</h1>
          <p className="text-slate-600 mt-1">Kelola konten dan tampilan layar monitoring</p>
        </div>

        <DisplaySettingsForm settings={settings} />
      </div>
    </div>
  )
}