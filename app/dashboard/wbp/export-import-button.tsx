"use client"

import { useState } from "react"
import { Download, Upload, Loader2, X, FileSpreadsheet, AlertCircle, FileDown } from "lucide-react"
import { useToast } from "@/components/ui/toast-container"

export function ExportImportButton() {
  const { showToast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    successCount?: number
    errorCount?: number
    errors?: string[]
  } | null>(null)

  // ✅ DOWNLOAD TEMPLATE
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/wbp/template")
      if (!response.ok) throw new Error("Gagal download template")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "Template_Import_WBP.xlsx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      showToast("✅ Template berhasil didownload!", "success")
    } catch (error) {
      showToast("❌ Gagal download template!", "error")
      console.error(error)
    }
  }

  // ✅ HANDLE EXPORT
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/wbp/export")
      
      if (!response.ok) throw new Error("Gagal export data")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Data_WBP_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      showToast("✅ Data berhasil di-export!", "success")
    } catch (error) {
      showToast("❌ Gagal export data!", "error")
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }

  // ✅ HANDLE IMPORT
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      showToast("❌ File harus berformat Excel (.xlsx atau .xls)!", "error")
      e.target.value = ""
      return
    }

    // Validasi file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("❌ Ukuran file maksimal 5MB!", "error")
      e.target.value = ""
      return
    }

    setIsImporting(true)
    setImportResult(null)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/wbp/import", {
        method: "POST",
        body: formData
      })

      const result = await response.json()
      setImportResult(result)

      if (result.success) {
        showToast(result.message, "success")
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        showToast(result.error || "Gagal import data!", "error")
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Gagal import data!"
      showToast(`❌ ${errorMsg}`, "error")
      setImportResult({
        success: false,
        message: errorMsg
      })
    } finally {
      setIsImporting(false)
      e.target.value = ""
    }
  }

  return (
    <>
      {/* ✅ BUTTON UTAMA - Buka Modal */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-blue-200"
      >
        <FileSpreadsheet size={18} />
        Export & Import
      </button>

      {/* ✅ MODAL EXPORT & IMPORT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                  <FileSpreadsheet className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Export & Import Data WBP</h2>
                  <p className="text-blue-100 text-sm">Download atau upload data warga binaan</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setImportResult(null)
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="text-white" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* ✅ SECTION 1: EXPORT */}
              <div className="border-2 border-green-200 rounded-xl p-5 bg-green-50/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Download className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900">Export Data WBP</h3>
                    <p className="text-sm text-green-700">Download semua data warga binaan aktif ke Excel</p>
                  </div>
                </div>
                
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown size={20} />
                      Download Data WBP (.xlsx)
                    </>
                  )}
                </button>
              </div>

              {/* ✅ SECTION 2: IMPORT */}
              <div className="border-2 border-blue-200 rounded-xl p-5 bg-blue-50/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Upload className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">Import Data WBP</h3>
                    <p className="text-sm text-blue-700">Upload file Excel untuk import data WBP secara massal</p>
                  </div>
                </div>

                {/* Instruksi */}
                <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Petunjuk Import:
                  </h4>
                  <ol className="space-y-1.5 text-sm text-blue-800 list-decimal list-inside">
                    <li>Download template Excel terlebih dahulu</li>
                    <li>Isi data sesuai kolom yang tersedia</li>
                    <li>Format tanggal: <code className="bg-blue-100 px-2 py-0.5 rounded">YYYY-MM-DD</code></li>
                    <li>NIK harus 16 digit</li>
                    <li>No. Registrasi harus unik</li>
                    <li>Jenis Kelamin: Laki-laki atau Perempuan</li>
                    <li>Jenis Pidana: PIDANA, TAHANAN, atau KURUNGAN</li>
                    <li>Status Penahanan: MAPENALING, NORMAL, ISOLASI, atau KARANTINA</li>
                    <li>Agama: ISLAM, KRISTEN, KATOLIK, HINDU, BUDDHA, atau KONGHUCU</li>
                    <li>Ukuran file maksimal 5MB</li>
                  </ol>
                </div>

                {/* Download Template */}
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg mb-4"
                >
                  <Download size={20} />
                  Download Template Excel
                </button>

                {/* Upload File */}
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 transition-colors cursor-pointer bg-white hover:bg-blue-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isImporting ? (
                      <>
                        <Loader2 className="animate-spin text-blue-600 mb-3" size={36} />
                        <p className="text-sm font-semibold text-blue-600">Importing...</p>
                        <p className="text-xs text-slate-500">Mohon tunggu sebentar</p>
                      </>
                    ) : (
                      <>
                        <Upload className="text-blue-400 mb-3" size={36} />
                        <p className="mb-2 text-sm font-semibold text-slate-700">
                          Klik untuk upload atau drag & drop
                        </p>
                        <p className="text-xs text-slate-500">Excel (.xlsx, .xls) Max 5MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImport}
                    disabled={isImporting}
                    className="hidden"
                  />
                </label>

                {/* Result Import */}
                {importResult && (
                  <div className={`mt-4 rounded-xl border-2 p-4 ${
                    importResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      importResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {importResult.success ? '✅ Import Berhasil!' : '❌ Import Gagal!'}
                    </h4>
                    <p className={`text-sm mb-3 ${
                      importResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {importResult.message}
                    </p>
                    
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-semibold text-red-800 mb-2">Detail Error:</p>
                        <div className="max-h-40 overflow-y-auto bg-white rounded-lg p-3 border border-red-200">
                          {importResult.errors.map((error, idx) => (
                            <p key={idx} className="text-xs text-red-700 mb-1">• {error}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false)
                  setImportResult(null)
                }}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}