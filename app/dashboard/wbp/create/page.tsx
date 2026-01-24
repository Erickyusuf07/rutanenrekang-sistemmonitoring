"use client"

import { createWBP } from "@/actions/wbp"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, AlertCircle, CalendarDays, User, Scale, Phone } from "lucide-react"
import { ChangeEvent, useActionState, useState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast-container"

// ✅ Interface untuk Input
interface FormInputProps {
  label: string
  name: string
  type?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  helpText?: string
  maxLength?: number
  min?: string
  max?: string
  pattern?: string
  disabled?: boolean
}

// ✅ Interface untuk Select (PISAH!)
interface FormSelectProps {
  label: string
  name: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
  helpText?: string
  disabled?: boolean
  children: React.ReactNode
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-[#5E2390] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      {pending ? "Menyimpan..." : "Simpan Data WBP"}
    </button>
  )
}

function FormInput({ label, name, type = "text", placeholder, required = true, helpText, value, onChange, maxLength, min, max, pattern, disabled }: FormInputProps) {
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
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        min={min}
        max={max}
        pattern={pattern}
        disabled={disabled}
        className={`w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20 transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      />
      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  )
}

// ✅ FIX: Gunakan interface terpisah
function FormSelect({ label, name, required = true, helpText, value, onChange, children, disabled }: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20 transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      >
        {children}
      </select>
      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  )
}

export default function CreateWBPPage() {
  const [state, formAction] = useActionState(createWBP, null)
  const router = useRouter()
  const { showToast } = useToast()
  const hasNotified = useRef(false)
  // State untuk jenis pidana
  const [jenisPidana, setJenisPidana] = useState("")

  // State untuk auto-compute dates
  const [tglMasuk, setTglMasuk] = useState("")
  const [tglVonis, setTglVonis] = useState("")
  const [vonisHukuman, setVonisHukuman] = useState("")
  const [tglMapenaling, setTglMapenaling] = useState("")
  const [tglBebas, setTglBebas] = useState("")

  // ✅ LOGIC: TAHANAN = field vonis TIDAK WAJIB
  const isTahanan = jenisPidana === "TAHANAN"
  const isPidana = jenisPidana === "PIDANA"

  // Handle jenis pidana changed
  const handleJenisPidanaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setJenisPidana(val)
    
    // ✅ Reset fields jika ganti jenis pidana
    if (val === "TAHANAN") {
      setTglVonis("")
      setVonisHukuman("")
      setTglBebas("")
    }
  }

  // Handle tanggal masuk changed
  const handleTglMasukChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTglMasuk(val)
    if (val) {
      const date = new Date(val)
      date.setDate(date.getDate() + 14)
      setTglMapenaling(date.toISOString().split('T')[0])
    }
  }

  // Handle vonis + hukuman → auto-compute tanggal bebas
  const handleVonisChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTglVonis(val)
    computeTglBebas(val, vonisHukuman)
  }

  const handleVonisHukumanChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setVonisHukuman(val)
    computeTglBebas(tglVonis, val)
  }

  const computeTglBebas = (vonis: string, bulan: string) => {
    if (vonis && bulan) {
      const date = new Date(vonis)
      date.setMonth(date.getMonth() + parseInt(bulan))
      setTglBebas(date.toISOString().split('T')[0])
    }
  }

  // Show toast on success
  useEffect(() => {
    if (state?.success && !hasNotified.current) {
      hasNotified.current = true // ✅ Set flag jadi true
      showToast("✅ Data WBP berhasil disimpan!", "success")
      
      // ✅ Redirect dengan delay
      const timer = setTimeout(() => {
        router.push("/dashboard/wbp")
      }, 1000)
      
      return () => clearTimeout(timer) // ✅ Cleanup
    }
  }, [state, router, showToast]) 

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/wbp"
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-[#5E2390] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registrasi Warga Binaan</h1>
          <p className="text-sm text-slate-500">Input data WBP baru secara lengkap</p>
        </div>
      </div>

      {/* Alert Error */}
      {state?.error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 animate-slide-up">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{state.error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <form action={formAction} className="space-y-8">

          {/* SECTION 1: IDENTITAS */}
          <div>
            <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#5E2390] border-b border-slate-200 pb-3">
              <User size={18} />
              1. Data Identitas
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <FormInput
                label="Nama Lengkap"
                name="nama"
                placeholder="Contoh: Ahmad Rifai"
              />
              <FormInput
                label="No. Registrasi"
                name="noRegistrasi"
                placeholder="Contoh: WBP-2026-001"
                helpText="Format bebas, harus unik"
              />
              <FormInput
                label="NIK"
                name="nik"
                placeholder="16 digit"
                maxLength={16}
                pattern="[0-9]{16}"
                helpText="Masukkan 16 digit NIK"
              />
              <FormSelect label="Jenis Kelamin" name="jenisKelamin">
                <option value="">Pilih...</option>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </FormSelect>
              <FormInput
                label="Tempat Lahir"
                name="tempatLahir"
                placeholder="Contoh: Enrekang"
              />
              <FormInput
                label="Tanggal Lahir"
                name="tanggalLahir"
                type="date"
                max={new Date().toISOString().split('T')[0]}
              />
              <FormSelect label="Agama" name="agama">
                <option value="">Pilih...</option>
                <option value="ISLAM">Islam</option>
                <option value="KRISTEN">Kristen</option>
                <option value="KATOLIK">Katolik</option>
                <option value="HINDU">Hindu</option>
                <option value="BUDDHA">Buddha</option>
                <option value="KONGHUCU">Konghucu</option>
              </FormSelect>
              <FormInput
                label="Pendidikan Terakhir"
                name="pendidikan"
                placeholder="Contoh: SMA"
                required={false}
              />
              <FormInput
                label="Pekerjaan"
                name="pekerjaan"
                placeholder="Contoh: Wiraswasta"
                required={false}
              />
            </div>
            <div className="mt-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="alamat"
                  required
                  rows={3}
                  placeholder="Contoh: Jl. Pattimura No. 15, Enrekang"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: KONTAK KELUARGA */}
          <div>
            <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-3">
              <Phone size={18} />
              2. Kontak Keluarga
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <FormInput
                label="Nama Keluarga"
                name="namaKeluarga"
                placeholder="Contoh: Siti Aminah (Istri)"
                required={false}
              />
              <FormInput
                label="No. Telepon Keluarga"
                name="noTeleponKeluarga"
                type="tel"
                placeholder="Contoh: 081234567890"
                required={false}
              />
            </div>
          </div>

          {/* SECTION 3: PERKARA */}
          <div>
            <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-700 border-b border-slate-200 pb-3">
              <Scale size={18} />
              3. Data Perkara & Hukuman
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800">
                    Perkara / Pasal <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="perkara"
                    required
                    rows={2}
                    placeholder="Contoh: Pencurian dengan Pemberatan (Pasal 363 KUHP)"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20"
                  />
                </div>
              </div>

              {/* ✅ JENIS PIDANA - TRIGGER LOGIC */}
              <FormSelect 
                label="Jenis Pidana" 
                name="jenisPidana"
                value={jenisPidana}
                onChange={handleJenisPidanaChange}
              >
                <option value="">Pilih...</option>
                <option value="TAHANAN">Tahanan (Belum Vonis)</option>
                <option value="PIDANA">Pidana (Sudah Vonis)</option>
              </FormSelect>

              {/* ✅ INFO BOX - PENJELASAN */}
              {jenisPidana && (
                <div className={`md:col-span-2 rounded-lg border-2 p-4 ${isTahanan ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className={isTahanan ? 'text-yellow-600' : 'text-green-600'} />
                    <div className="text-sm">
                      {isTahanan ? (
                        <>
                          <p className="font-bold text-yellow-800">Mode: TAHANAN (Belum Vonis)</p>
                          <p className="text-yellow-700 mt-1">
                            WBP belum ada putusan hakim. Field Vonis Hukuman & Tanggal Vonis <strong>tidak wajib diisi</strong>. 
                            Tanggal bebas akan dihitung setelah ada vonis.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-green-800">Mode: PIDANA (Sudah Vonis)</p>
                          <p className="text-green-700 mt-1">
                            WBP sudah ada putusan hakim. Field Vonis Hukuman & Tanggal Vonis <strong>wajib diisi</strong>. 
                            Tanggal bebas akan dihitung otomatis.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ VONIS HUKUMAN - CONDITIONAL REQUIRED */}
              <FormInput
                label="Vonis Hukuman (Bulan)"
                name="vonisHukuman"
                type="number"
                min="1"
                placeholder={isTahanan ? "Belum ada vonis" : "Contoh: 12"}
                value={vonisHukuman}
                onChange={handleVonisHukumanChange}
                required={isPidana}
                disabled={isTahanan}
                helpText={isTahanan ? "Tidak wajib (belum vonis)" : "Wajib diisi"}
              />

              {/* ✅ TANGGAL VONIS - CONDITIONAL REQUIRED */}
              <FormInput
                label="Tanggal Vonis"
                name="tanggalVonis"
                type="date"
                value={tglVonis}
                onChange={handleVonisChange}
                max={new Date().toISOString().split('T')[0]}
                required={isPidana}
                disabled={isTahanan}
                helpText={isTahanan ? "Tidak wajib (belum vonis)" : "Wajib diisi"}
              />

              <FormInput
                label="Nama Pengacara"
                name="namaPengacara"
                placeholder="Contoh: H. Ahmad Yani, S.H."
                required={false}
              />
            </div>
          </div>

          {/* SECTION 4: MASA TAHANAN */}
          <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 border border-orange-200">
            <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-800">
              <CalendarDays size={18} />
              4. Perhitungan Masa Tahanan
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
                <FormInput
                  label="Tanggal Masuk Rutan"
                  name="tanggalMasuk"
                  type="date"
                  value={tglMasuk}
                  onChange={handleTglMasukChange}
                  helpText="Tanggal awal penahanan"
                />
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-yellow-300">
                <FormInput
                  label="Selesai Mapenaling"
                  name="jadwalSelesaiMapenaling"
                  type="date"
                  value={tglMapenaling}
                  onChange={(e) => setTglMapenaling(e.target.value)}
                  helpText="Otomatis: Tgl Masuk + 14 hari"
                />
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                <FormInput
                  label="Tanggal Bebas"
                  name="tanggalBebas"
                  type="date"
                  value={tglBebas}
                  onChange={(e) => setTglBebas(e.target.value)}
                  helpText={isTahanan ? "Belum bisa dihitung (belum vonis)" : "Otomatis: Tgl Vonis + Vonis Bulan"}
                  disabled={isTahanan && !tglBebas}
                  required={isPidana}
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: STATUS & CATATAN */}
          <div>
            <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-700 border-b border-slate-200 pb-3">
              <AlertCircle size={18} />
              5. Status & Catatan
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <FormSelect label="Status Penahanan" name="statusPenahanan">
                <option value="">Pilih...</option>
                <option value="MAPENALING">Mapenaling (14 hari pertama)</option>
                <option value="NORMAL">Normal (Tahanan biasa)</option>
                <option value="ISOLASI">Isolasi</option>
                <option value="KARANTINA">Karantina</option>
              </FormSelect>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">
                  Catatan Khusus
                </label>
                <textarea
                  name="catatanKhusus"
                  rows={3}
                  placeholder="Contoh: Kondisi sehat, kooperatif"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#5E2390] focus:ring-2 focus:ring-[#5E2390]/20"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Link
              href="/dashboard/wbp"
              className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Batal
            </Link>
            <SubmitButton />
          </div>

        </form>
      </div>
    </div>
  )
}