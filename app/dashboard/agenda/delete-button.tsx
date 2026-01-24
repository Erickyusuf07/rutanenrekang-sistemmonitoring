"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast-container"

interface DeleteAgendaButtonProps {
    id: string
    judul: string
}

export default function DeleteAgendaButton({ id, judul }: DeleteAgendaButtonProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const [showConfirm, setShowConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/agenda/${id}`, {
                method: "DELETE",
            })

            const result = await response.json()

            if (result.success) {
                showToast("Agenda berhasil dihapus!", "success")
                router.refresh()
                setShowConfirm(false)
            } else {
                showToast(result.error || "Gagal menghapus agenda!", "error")
            }
        } catch (error) {
            console.error("Delete error:", error)
            showToast(" Terjadi kesalahan!", "error")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                title="Hapus Agenda"
            >
                <Trash2 size={16} />
            </button>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                                Hapus Agenda?
                            </h3>
                            <p className="text-slate-600 text-center mb-4">
                                Apakah Anda yakin ingin menghapus agenda:
                            </p>
                            <div className="bg-slate-50 rounded-lg p-3 mb-6">
                                <p className="font-semibold text-slate-800 text-center">{judul}</p>
                            </div>
                            <p className="text-sm text-red-600 text-center mb-6">
                                Data yang dihapus tidak dapat dikembalikan!
                            </p>
                        </div>

                        <div className="flex gap-3 p-6 bg-slate-50 border-t">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 rounded-lg bg-white border-2 border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Menghapus...
                                    </>
                                ) : (
                                    "Ya, Hapus"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}