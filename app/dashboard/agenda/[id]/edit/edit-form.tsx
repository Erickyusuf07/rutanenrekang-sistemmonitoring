// app/dashboard/agenda/[id]/edit/edit-form.tsx
'use client'

import { updateAgenda } from "@/actions/agenda"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, AlertCircle, CalendarRange } from "lucide-react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

// 1. KITA DEFINISIKAN BENTUK DATANYA (INTERFACE)
// Ini solusi penghapus error "Unexpected any"
interface AgendaData {
  id: string
  judul: string
  lokasi: string | null
  deskripsi: string | null
  waktuMulai: Date
  waktuSelesai: Date | null
}

// Helper convert Date ke String untuk input datetime-local
const formatDateForInput = (date: Date | null) => {
  if (!date) return ""
  const d = new Date(date)
  const offset = d.getTimezoneOffset() * 60000
  const localIso = new Date(d.getTime() - offset).toISOString().slice(0, 16)
  return localIso
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-[#5E2390] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-purple-800 hover:shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      {pending ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
    </button>
  )
}

// 2. TERAPKAN INTERFACE DI SINI
export default function EditAgendaForm({ agenda }: { agenda: AgendaData }) {
  const [state, formAction] = useActionState(updateAgenda, null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/agenda"
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-[#5E2390]"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Agenda</h1>
          <p className="text-sm text-slate-500">Perbarui detail kegiatan</p>
        </div>
      </div>

      {/* Alert Error */}
      {state?.error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 animate-pulse">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{state.error}</p>
        </div>
      )}

      {/* Form Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <form action={formAction} className="space-y-8">
          
          <input type="hidden" name="id" value={agenda.id} />

          {/* Identitas Kegiatan */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#5E2390] border-b border-slate-100 pb-2">
              1. Detail Kegiatan
            </h3>
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Judul Kegiatan</label>
                <input 
                  name="judul" 
                  type="text" 
                  defaultValue={agenda.judul}
                  required 
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-black placeholder-gray-500 shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Lokasi / Tempat</label>
                <input 
                  name="lokasi" 
                  type="text" 
                  defaultValue={agenda.lokasi || ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-black placeholder-gray-500 shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Deskripsi Singkat</label>
                <textarea 
                  name="deskripsi"
                  rows={3}
                  defaultValue={agenda.deskripsi || ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-black placeholder-gray-500 shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Waktu Pelaksanaan */}
          <div className="rounded-xl bg-purple-50 p-6 border border-purple-100">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#5E2390]">
              <CalendarRange size={18} />
              2. Waktu Pelaksanaan
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Waktu Mulai</label>
                <input 
                  name="waktuMulai" 
                  type="datetime-local" 
                  defaultValue={formatDateForInput(agenda.waktuMulai)}
                  required 
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-black shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Waktu Selesai</label>
                <input 
                  name="waktuSelesai" 
                  type="datetime-local" 
                  defaultValue={formatDateForInput(agenda.waktuSelesai)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-black shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <SubmitButton />
          </div>

        </form>
      </div>
    </div>
  )
}