'use client'

import { useState, useActionState } from "react"
import { Pengumuman } from "@prisma/client"
import { createPengumuman, updatePengumuman, deletePengumuman, togglePengumumanStatus } from "@/actions/pengumuman"
import { Plus, Edit, Trash2, Eye, EyeOff, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface Stats {
  total: number
  active: number
  priority: number
  info: number
  warning: number
  urgent: number
  success: number
}

export default function PengumumanDisplayList({ 
  pengumumanList,
  stats
}: { 
  pengumumanList: Pengumuman[]
  stats: Stats
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const editData = editingId 
    ? pengumumanList.find(p => p.id === editingId) 
    : null

  const getTipeColor = (tipe: string) => {
    switch (tipe) {
      case "INFO": return "bg-blue-50 text-blue-700 border-blue-200"
      case "WARNING": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "URGENT": return "bg-red-50 text-red-700 border-red-200"
      case "SUCCESS": return "bg-green-50 text-green-700 border-green-200"
      default: return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const getTipeIcon = (tipe: string) => {
    switch (tipe) {
      case "INFO": return <Info size={16} />
      case "WARNING": return <AlertTriangle size={16} />
      case "URGENT": return <AlertCircle size={16} />
      case "SUCCESS": return <CheckCircle size={16} />
      default: return <Info size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {/* STATISTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Pengumuman" 
          value={stats.total} 
          gradient="from-purple-50 to-purple-100"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          icon="📢"
        />
        <StatCard 
          label="Aktif" 
          value={stats.active} 
          gradient="from-green-50 to-green-100"
          iconBg="bg-green-100"
          iconColor="text-green-600"
          icon="✅"
        />
        <StatCard 
          label="Prioritas" 
          value={stats.priority} 
          gradient="from-red-50 to-red-100"
          iconBg="bg-red-100"
          iconColor="text-red-600"
          icon="⭐"
        />
        <StatCard 
          label="Mendesak" 
          value={stats.urgent} 
          gradient="from-orange-50 to-orange-100"
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          icon="🚨"
        />
      </div>

      {/* BUTTON TAMBAH */}
      <button
        onClick={() => {
          setShowForm(true)
          setEditingId(null)
        }}
        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-[#5E2390] to-[#7C22CE] text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
      >
        <Plus size={20} />
        Tambah Pengumuman Baru
      </button>

      {/* FORM CREATE/EDIT */}
      {showForm && (
        <PengumumanForm 
          editData={editData ?? null}
          onClose={() => {
            setShowForm(false)
            setEditingId(null)
          }}
        />
      )}

      {/* LIST PENGUMUMAN */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Daftar Pengumuman</h2>
          
          {pengumumanList.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Info size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">Belum ada pengumuman</p>
              <p className="text-sm">Klik tombol di atas untuk menambahkan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pengumumanList.map((pengumuman) => (
                <div 
                  key={pengumuman.id}
                  className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-md ${
                    getTipeColor(pengumuman.tipe)
                  } ${!pengumuman.isActive ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTipeIcon(pengumuman.tipe)}
                        <h3 className="font-bold text-lg">{pengumuman.judul}</h3>
                        {pengumuman.isPriority && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                            PRIORITAS
                          </span>
                        )}
                        {!pengumuman.isActive && (
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                            NON-AKTIF
                          </span>
                        )}
                      </div>
                      <p className="text-sm mb-2">{pengumuman.isi}</p>
                      <p className="text-xs opacity-70">
                        Dibuat: {new Date(pengumuman.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await togglePengumumanStatus(pengumuman.id)
                        }}
                        className="p-2 bg-white rounded-lg hover:bg-slate-50 transition-all"
                        title={pengumuman.isActive ? "Nonaktifkan" : "Aktifkan"}
                      >
                        {pengumuman.isActive ? (
                          <Eye size={18} className="text-green-600" />
                        ) : (
                          <EyeOff size={18} className="text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(pengumuman.id)
                          setShowForm(true)
                        }}
                        className="p-2 bg-white rounded-lg hover:bg-blue-50 transition-all"
                      >
                        <Edit size={18} className="text-blue-600" />
                      </button>

                      <button
                        onClick={() => setDeleteId(pengumuman.id)}
                        className="p-2 bg-white rounded-lg hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE */}
      {deleteId && (
        <ConfirmDialog
                  title="Hapus Pengumuman"
                  message="Apakah Anda yakin ingin menghapus pengumuman ini?"
                  onConfirm={async () => {
                      await deletePengumuman(deleteId)
                      setDeleteId(null)
                  } }
                  onCancel={() => setDeleteId(null)} isOpen={false}        />
      )}
    </div>
  )
}

// ✅ FORM COMPONENT
function PengumumanForm({ 
  editData, 
  onClose 
}: { 
  editData: Pengumuman | null
  onClose: () => void 
}) {
  const [state, formAction, pending] = useActionState(
    editData ? updatePengumuman : createPengumuman,
    null
  )

  return (
    <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-4">
        {editData ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}
      </h3>

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {state.error}
        </div>
      )}

      {state?.message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {editData && <input type="hidden" name="id" value={editData.id} />}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Judul Pengumuman *
          </label>
          <input
            type="text"
            name="judul"
            defaultValue={editData?.judul}
            required
            className="w-full px-4 py-2 border border-slate-300 text-black rounded-lg focus:ring-2 focus:ring-[#5E2390] focus:border-transparent"
            placeholder="Contoh: Libur Nasional Hari Raya"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Isi Pengumuman *
          </label>
          <textarea
            name="isi"
            defaultValue={editData?.isi}
            required
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 text-black rounded-lg focus:ring-2 focus:ring-[#5E2390] focus:border-transparent"
            placeholder="Tulis isi pengumuman lengkap di sini..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tipe Pengumuman
          </label>
          <select
            name="tipe"
            defaultValue={editData?.tipe || "INFO"}
            className="w-full px-4 py-2 border border-slate-300 text-black rounded-lg focus:ring-2 focus:ring-[#5E2390] focus:border-transparent"
          >
            <option value="INFO">📘Info (Biru)</option>
            <option value="WARNING">⚠️ Warning (Kuning)</option>
            <option value="URGENT">🚨 Urgent (Merah)</option>
            <option value="SUCCESS">✅ Success (Hijau)</option>
          </select>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isPriority"
              value="true"
              defaultChecked={editData?.isPriority}
              className="w-4 h-4 text-[#5E2390] rounded focus:ring-[#5E2390]"
            />
            <span className="text-sm font-medium text-black">Prioritas (Tampil di atas)</span>
          </label>

          {editData && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked={editData?.isActive}
                className="w-4 h-4 text-[#5E2390] rounded focus:ring-[#5E2390]"
              />
              <span className="text-sm font-medium">✅ Aktif</span>
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 bg-linear-to-r from-[#5E2390] to-[#7C22CE] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : editData ? "Perbarui" : "Tambah"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}

// ✅ STAT CARD
function StatCard({ 
  label, 
  value, 
  gradient, 
  iconBg, 
  iconColor,
  icon
}: { 
  label: string
  value: number
  gradient: string
  iconBg: string
  iconColor: string
  icon: string
}) {
  return (
    <div className={`backdrop-blur-xl bg-linear-to-br ${gradient} border border-white/20 rounded-2xl shadow-xl p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <span className={`text-2xl ${iconColor}`}>{icon}</span>
        </div>
      </div>
    </div>
  )
}