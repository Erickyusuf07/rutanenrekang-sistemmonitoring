// app/dashboard/golongan/create-form.tsx
'use client'

import { createGolongan } from "@/actions/golongan"
import { Save, Loader2, AlertCircle, CheckCircle2, PlusCircle } from "lucide-react"
import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      // PERBAIKAN DESAIN TOMBOL:
      // px-6 (kiri kanan lega), py-3 (atas bawah lega), gap-3 (jarak ikon)
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5E2390] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-purple-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      {pending ? "Menyimpan Data..." : "Simpan Data Baru"}
    </button>
  )
}

export default function CreateGolonganForm() {
  const [state, formAction] = useActionState(createGolongan, null)
  const formRef = useRef<HTMLFormElement>(null)

  // Reset form otomatis jika sukses
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    // CONTAINER BARU: Glassmorphism halus
    <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-md md:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-purple-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-[#5E2390]">
            <PlusCircle size={20} />
        </div>
        <h3 className="text-lg font-bold text-[#5E2390]">Tambah Pangkat Baru</h3>
      </div>
      
      {/* Alert Error */}
      {state?.error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 animate-pulse">
          <AlertCircle size={18} /> {state.error}
        </div>
      )}

      {/* Alert Sukses */}
      {state?.success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-600 border border-green-100">
          <CheckCircle2 size={18} /> {state.success}
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Kode Golongan</label>
          {/* INPUT BARU: Lebih modern, rounded-xl */}
          <input 
            name="kode" 
            type="text" 
            placeholder="Contoh: III/a" 
            required
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#5E2390] focus:bg-white focus:ring-2 focus:ring-[#5E2390]/20"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Pangkat</label>
          <input 
            name="nama" 
            type="text" 
            placeholder="Contoh: Penata Muda" 
            required
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#5E2390] focus:bg-white focus:ring-2 focus:ring-[#5E2390]/20"
          />
        </div>
        
        {/* POSISI TOMBOL: Kanan bawah, sleek */}
        <div className="mt-8 pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}