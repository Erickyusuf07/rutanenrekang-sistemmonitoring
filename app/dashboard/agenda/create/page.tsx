// app/dashboard/agenda/create/page.tsx
'use client'

import { createAgenda } from "@/actions/agenda"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, AlertCircle, CalendarRange } from "lucide-react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

// Interface Props agar Type Safe
interface FormInputProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  helpText?: string
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
      {pending ? "Menyimpan Agenda..." : "Simpan Agenda"}
    </button>
  )
}

function FormInput({ label, name, type = "text", placeholder, required = true, helpText }: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        name={name} 
        type={type} 
        required={required} 
        placeholder={placeholder} 
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-black placeholder-gray-500 shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20" 
      />
      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}
    </div>
  )
}

export default function CreateAgendaPage() {
  const [state, formAction] = useActionState(createAgenda, null)

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/agenda"
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-[#5E2390]"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buat Agenda Baru</h1>
          <p className="text-sm text-slate-500">Jadwal kegiatan resmi pimpinan</p>
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
          
          {/* Identitas Kegiatan */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#5E2390] border-b border-slate-100 pb-2">
              1. Detail Kegiatan
            </h3>
            <div className="grid gap-6">
              <FormInput 
                label="Judul Kegiatan" 
                name="judul" 
                placeholder="Contoh: Rapat Koordinasi Kanwil Sulsel" 
              />
              <FormInput 
                label="Lokasi / Tempat" 
                name="lokasi" 
                placeholder="Contoh: Aula Rutan Enrekang / Zoom Meeting" 
              />
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Deskripsi Singkat (Opsional)</label>
                <textarea 
                  name="deskripsi"
                  rows={3}
                  placeholder="Catatan tambahan mengenai kegiatan..."
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
              <FormInput 
                label="Waktu Mulai" 
                name="waktuMulai" 
                type="datetime-local" // Input Tanggal + Jam
                helpText="Kapan kegiatan dimulai."
              />
              <FormInput 
                label="Waktu Selesai (Estimasi)" 
                name="waktuSelesai" 
                type="datetime-local" 
                required={false}
                helpText="Boleh dikosongkan jika belum pasti."
              />
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