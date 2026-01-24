'use client'

import { updateGolongan } from "@/actions/golongan"
import { Save, Loader2, X, Pencil } from "lucide-react"
import { useActionState, useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useToast } from "@/components/ui/toast-container"

interface GolonganData {
  id: string
  kode: string
  nama: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5E2390] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-purple-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      {pending ? "Menyimpan..." : "Simpan Perubahan"}
    </button>
  )
}

export default function EditGolonganModal({ data }: { data: GolonganData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction] = useActionState(updateGolongan, null)
  const { showToast } = useToast()

  // Tampilkan toast dan tutup modal jika sukses/error
  useEffect(() => {
    if (state?.success) {
      showToast(state.success, "success")
      const timer = setTimeout(() => {
        setIsOpen(false)
      }, 100)
      return () => clearTimeout(timer)
    }
    if (state?.error) {
      showToast(state.error, "error")
    }
  }, [state, showToast])

  return (
    <>
      {/* Tombol Pemicu (Icon Pensil) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
        title="Edit Data"
      >
        <Pencil size={18} />
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Gelap (Klik luar untuk tutup) */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Konten Modal */}
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-bold text-[#5E2390]">Edit Pangkat / Golongan</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Form */}
              <form action={formAction} className="space-y-5">
                <input type="hidden" name="id" value={data.id} />
                
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Kode Golongan
                  </label>
                  <input 
                    name="kode" 
                    type="text" 
                    defaultValue={data.kode}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Nama Pangkat
                  </label>
                  <input 
                    name="nama" 
                    type="text" 
                    defaultValue={data.nama}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20 outline-none"
                  />
                </div>

                <div className="mt-8 flex justify-end border-t border-slate-50 pt-4">
                  <SubmitButton />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}