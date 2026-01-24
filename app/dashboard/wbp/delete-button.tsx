"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteWBP } from "@/actions/wbp"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast-container"

interface DeleteWBPButtonProps {
  id: string
  nama: string
}

export default function DeleteWBPButton({ id, nama }: DeleteWBPButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const { showToast } = useToast()

  const handleDelete = async () => {
    try {
      await deleteWBP(id)
      showToast(`Data ${nama} berhasil dihapus!`, "success")
      setShowDialog(false)
    } catch {
      showToast("Gagal menghapus data!", "error")
    }
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        title="Hapus Data"
      >
        <Trash2 size={18} />
      </button>

      <ConfirmDialog
        isOpen={showDialog}
        title="Hapus Data WBP?"
        message={`Apakah Anda yakin ingin menghapus data "${nama}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        onCancel={() => setShowDialog(false)}
        type="danger"
      />
    </>
  )
}