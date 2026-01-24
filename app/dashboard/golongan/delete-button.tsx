'use client'

import { deleteGolongan } from "@/actions/golongan"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toast-container"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useState } from "react"

interface DeleteGolonganButtonProps {
  id: string
}

export default function DeleteGolonganButton({ id }: DeleteGolonganButtonProps) {
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    setShowConfirm(false)
    setIsDeleting(true)

    try {
      const result = await deleteGolongan(id)
      
      if (result.success) {
        showToast(result.success, "success")
      } else if (result.error) {
        showToast(result.error, "error")
      }
    } catch (error) {
      showToast("❌ Gagal menghapus data golongan!", "error")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button 
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Hapus Data"
      >
        {isDeleting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Trash2 size={18} />
        )}
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Hapus Golongan / Pangkat"
        message="Yakin hapus data ini? Golongan yang sedang digunakan pegawai tidak dapat dihapus."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}