'use client'

import { useState, useRef } from "react"
import { Download, Upload, FileSpreadsheet, X, Loader2, AlertCircle, CheckCircle, Info } from "lucide-react"
import * as XLSX from "xlsx"
import { importPegawai, type ImportPegawaiData } from "@/actions/pegawai"
import { Pegawai } from "@prisma/client"

interface ImportExportModalProps {
    data: Pegawai[]
    onRefresh: () => void
}

export default function ImportExportModal({ data, onRefresh }: ImportExportModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleExport = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const cleanData = data.map(({ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, golonganId: _golonganId, ...rest }) => ({
            ...rest,
            // ✅ TAMBAHKAN KODE GOLONGAN UNTUK EXPORT
            golongan: (rest as { golongan?: { kode?: string } }).golongan?.kode || 'N/A'
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(cleanData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pegawai")
        XLSX.writeFile(workbook, `Data_Pegawai_${new Date().toISOString().split('T')[0]}.xlsx`)
        
        setMessage({ type: 'success', text: 'Data berhasil diekspor ke file Excel' })
        setTimeout(() => setMessage(null), 3000)
    }

    const downloadTemplate = () => {
        const template: ImportPegawaiData[] = [
            {
                nama: "Budi Santoso",
                nip: "199001012020011001",
                jabatan: "Kepala Regu Jaga",
                golongan: "III/a",
                jenisKelamin: "LAKI_LAKI",
                tmtPangkatTerakhir: "2020-01-01",
                jadwalNaikPangkat: "2024-01-01",
                tmtGajiTerakhir: "2022-01-01",
                jadwalKenaikanGaji: "2024-01-01",
                tempatLahir: "Enrekang",
                tanggalLahir: "1990-01-01",
                noTelepon: "081234567890",
                alamat: "Jl. Poros Makassar-Enrekang No. 123",
                pendidikanTerakhir: "S1 Administrasi Negara",
                tanggalMasuk: "2020-01-01"
            }
        ]
        const worksheet = XLSX.utils.json_to_sheet(template)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
        XLSX.writeFile(workbook, "Template_Import_Pegawai_Rutan_Enrekang.xlsx")
        
        setMessage({ type: 'success', text: 'Template berhasil diunduh' })
        setTimeout(() => setMessage(null), 3000)
    }

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsImporting(true)
        setMessage(null)

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const bstr = event.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                
                const rawJson = XLSX.utils.sheet_to_json(ws) as ImportPegawaiData[]
                const plainData = JSON.parse(JSON.stringify(rawJson))

                const result = await importPegawai(plainData)
                
                if (result.error) {
                    setMessage({ type: 'error', text: result.error })
                } else {
                    setMessage({ type: 'success', text: result.message || "Import berhasil dilaksanakan" })
                    onRefresh();
                    setTimeout(() => setIsOpen(false), 4000)
                }
            } catch (error) {
                console.error("File Read Error:", error)
                setMessage({ type: 'error', text: "Gagal membaca file. Pastikan format file sesuai template." })
            } finally {
                setIsImporting(false)
                if (fileInputRef.current) fileInputRef.current.value = ""
            }
        }
        reader.readAsBinaryString(file)
    }

    if (!isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-all"
        >
            <FileSpreadsheet size={18} />
            Kelola Data Excel
        </button>
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#5E2390] rounded-xl">
                            <FileSpreadsheet size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Pengelolaan Data Excel</h2>
                            <p className="text-sm text-slate-500">Export dan Import Data Kepegawaian</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Alert Message */}
                    {message && (
                        <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium border-2 ${
                            message.type === 'success' 
                                ? 'bg-green-50 border-green-200 text-green-800' 
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            {message.type === 'success' ? (
                                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            )}
                            <p className="whitespace-pre-line">{message.text}</p>
                        </div>
                    )}

                    {/* Petunjuk Penggunaan */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-900 space-y-2">
                                <p className="font-bold">PETUNJUK IMPORT DATA:</p>
                                <ol className="list-decimal list-inside space-y-1 ml-2">
                                    <li>Unduh template Excel terlebih dahulu</li>
                                    <li>Isi data sesuai format yang tersedia</li>
                                    <li>Kolom <strong>golongan</strong> diisi dengan KODE (contoh: II/a, III/b)</li>
                                    <li>Format tanggal: <strong>YYYY-MM-DD</strong> (contoh: 2024-01-15)</li>
                                    <li>Kolom <strong>jenisKelamin</strong>: LAKI_LAKI atau PEREMPUAN</li>
                                    <li>Jika NIP sudah ada, data akan diperbarui secara otomatis</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Export Section */}
                    <div 
                        onClick={handleExport}
                        className="group p-5 rounded-xl border-2 border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                                <Download size={24} className="text-green-700" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 text-base">Export Data ke Excel</p>
                                <p className="text-sm text-slate-600">Unduh seluruh data pegawai dalam format Excel untuk keperluan backup atau analisis</p>
                            </div>
                        </div>
                    </div>

                    {/* Import Section */}
                    <label className="group block p-5 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImport}
                            disabled={isImporting}
                        />
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                                {isImporting ? (
                                    <Loader2 size={24} className="animate-spin text-blue-700" />
                                ) : (
                                    <Upload size={24} className="text-blue-700" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 text-base">
                                    {isImporting ? "Sedang Memproses..." : "Import Data dari Excel"}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {isImporting 
                                        ? "Mohon tunggu, sistem sedang memproses data" 
                                        : "Unggah file Excel untuk menambah atau memperbarui data pegawai secara massal"
                                    }
                                </p>
                            </div>
                        </div>
                    </label>

                    {/* Download Template */}
                    <div className="pt-4 border-t-2 border-slate-100">
                        <button
                            onClick={downloadTemplate}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5E2390] to-[#4C1D95] hover:from-[#4C1D95] hover:to-[#3D1675] text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-200"
                        >
                            <Download size={18} />
                            Unduh Template Excel
                        </button>
                        <p className="text-xs text-center text-slate-500 mt-2">
                            Template berisi contoh format data yang sesuai standar sistem
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}