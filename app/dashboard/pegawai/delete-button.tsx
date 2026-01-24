'use client'

import { deletePegawai } from "@/actions/pegawai"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/toast-container";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog"; // Tambahkan import

interface DeleteButtonProps {
  id: string;
  onRefresh: () => void;
}

export default function DeleteButton({ id, onRefresh }: DeleteButtonProps) {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // State untuk dialog
  
  async function handleDelete() {
    setShowConfirm(false); // Tutup dialog
    setIsDeleting(true);
    
    try {
      const result = await deletePegawai(id);
      showToast(result.message || "Data pegawai berhasil dihapus!", "success");
      
      setTimeout(() => {
        onRefresh();
        setIsDeleting(false);
      }, 800);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus data!";
      showToast(errorMessage, "error");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)} // Buka dialog, bukan langsung hapus
        disabled={isDeleting}
        className={`rounded-lg p-2 transition-colors ${
          isDeleting 
            ? 'opacity-50 cursor-not-allowed text-slate-300' 
            : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
        }`}
        title="Hapus Data"
      >
        {isDeleting ? (
          <Trash2 size={18} className="animate-pulse" />
        ) : (
          <Trash2 size={18} />
        )}
      </button>

      {/* Custom Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Hapus Data Pegawai?"
        message="Data pegawai yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin melanjutkan?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}