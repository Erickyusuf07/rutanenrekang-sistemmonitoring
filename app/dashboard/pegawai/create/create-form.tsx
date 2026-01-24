'use client'

import { createPegawai } from "@/actions/pegawai"
import Link from "next/link"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Calendar, 
  User, 
  Briefcase, 
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"
import { useActionState, useState, useEffect, useRef, ChangeEvent } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"

// --- INTERFACES (sama seperti sebelumnya) ---
interface PegawaiState {
  error?: string;
  message?: string;
}

interface GolonganOption {
  id: string
  kode: string
  nama: string
}

interface ConfigData {
  id: string
  tahunKenaikanPangkat: number
  tahunKenaikanGaji: number
  updatedAt: Date
}

interface FormInputProps {
  label: string
  name: string
  type?: string
  value?: string
  defaultValue?: string // TAMBAHKAN INI
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  helpText?: string
}

// --- KOMPONEN KECIL ---
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending} 
      className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      {pending ? "Menyimpan..." : "Simpan Data"}
    </button>
  )
}

// UPDATE KOMPONEN FormInput
function FormInput({ 
  label, 
  name, 
  type = "text", 
  value, 
  defaultValue, // TAMBAHKAN INI
  onChange, 
  placeholder, 
  required = false, 
  helpText 
}: FormInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        name={name} 
        type={type} 
        required={required} 
        // PERBAIKAN: Gunakan value ATAU defaultValue, tidak keduanya
        {...(value !== undefined ? { value, onChange } : { defaultValue })}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none transition-all" 
      />
      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}
    </div>
  )
}

// --- KOMPONEN UTAMA ---
export default function CreatePegawaiForm({ listGolongan, config }: { listGolongan: GolonganOption[]; config: ConfigData | null }) {
  const [state, formAction] = useActionState<PegawaiState | null, FormData>(createPegawai, null)
  const router = useRouter();
  const isRedirecting = useRef(false);

  const intervalPangkat = config?.tahunKenaikanPangkat || 4
  const intervalGaji = config?.tahunKenaikanGaji || 2

  // State HANYA untuk field yang butuh logic (TMT & Jadwal)
  const [tmtPangkat, setTmtPangkat] = useState("")
  const [tmtGaji, setTmtGaji] = useState("")
  const [jadwalPangkat, setJadwalPangkat] = useState("")
  const [jadwalGaji, setJadwalGaji] = useState("")

  const [isAutoPangkat, setIsAutoPangkat] = useState(true)
  const [isAutoGaji, setIsAutoGaji] = useState(true)

  // Logic TMT Pangkat
  const handleTmtPangkatChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTmtPangkat(val)
    
    if (val && isAutoPangkat) {
      const date = new Date(val)
      date.setFullYear(date.getFullYear() + intervalPangkat)
      setJadwalPangkat(date.toISOString().split('T')[0])
    }
  }

  // Logic TMT Gaji
  const handleTmtGajiChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTmtGaji(val)
    
    if (val && isAutoGaji) {
      const date = new Date(val)
      date.setFullYear(date.getFullYear() + intervalGaji)
      setJadwalGaji(date.toISOString().split('T')[0])
    }
  }

  // Toggle Pangkat
  const handleTogglePangkat = () => {
    const newMode = !isAutoPangkat;
    setIsAutoPangkat(newMode);
    
    if (newMode && tmtPangkat) {
      const date = new Date(tmtPangkat);
      date.setFullYear(date.getFullYear() + intervalPangkat);
      setJadwalPangkat(date.toISOString().split('T')[0]);
    }
  }

  // Toggle Gaji
  const handleToggleGaji = () => {
    const newMode = !isAutoGaji;
    setIsAutoGaji(newMode);
    
    if (newMode && tmtGaji) {
      const date = new Date(tmtGaji);
      date.setFullYear(date.getFullYear() + intervalGaji);
      setJadwalGaji(date.toISOString().split('T')[0]);
    }
  }

  // Handle Success/Error
  useEffect(() => {
    if (state?.message && !isRedirecting.current) {
      isRedirecting.current = true;
      setTimeout(() => {
        router.push("/dashboard/pegawai");
      }, 1500);
    }
  }, [state?.message, router]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/pegawai" 
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tambah Pegawai Baru</h1>
          <p className="text-xs text-slate-500">Isi data lengkap pegawai dengan teliti</p>
        </div>
      </div>

      {/* Alert Success */}
      {state?.message && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 text-sm animate-slide-in">
          <CheckCircle2 size={18} />
          <span>{state.message} • Mengalihkan...</span>
        </div>
      )}

      {/* Alert Error */}
      {state?.error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm animate-slide-in">
          <XCircle size={18} />
          <span>{state.error}</span>
        </div>
      )}

      {/* INFO BOX */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <AlertCircle size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-blue-900">Mode Otomatis Aktif</h3>
            <p className="text-xs text-blue-700">
              Jadwal kenaikan akan dihitung otomatis berdasarkan TMT yang Anda input. 
              Klik tombol <strong>MANUAL</strong> jika ingin set jadwal custom.
            </p>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        {/* SECTION 1: PERSONAL */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-slate-500" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">Identitas Personal</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* GUNAKAN defaultValue untuk field biasa */}
            <FormInput 
              label="Nama Lengkap" 
              name="nama" 
              placeholder="Contoh: Ahmad Fauzi" 
              required 
            />
            <FormInput 
              label="NIP" 
              name="nip" 
              placeholder="Contoh: 197001011990031001" 
              required 
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Tempat Lahir" 
                name="tempatLahir" 
                placeholder="Contoh: Makassar" 
              />
              <FormInput 
                label="Tanggal Lahir" 
                name="tanggalLahir" 
                type="date" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Jenis Kelamin</label>
              <select 
                name="jenisKelamin" 
                defaultValue="LAKI_LAKI"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none transition-all"
              >
                <option value="LAKI_LAKI">Laki-Laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>

            <FormInput 
              label="Nomor Telepon" 
              name="noTelepon" 
              type="tel"
              placeholder="Contoh: 081234567890" 
            />
            <FormInput 
              label="Pendidikan Terakhir" 
              name="pendidikanTerakhir" 
              placeholder="Contoh: S1 Hukum" 
            />

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Alamat</label>
              <textarea 
                name="alamat" 
                rows={2} 
                placeholder="Contoh: Jl. Ahmad Yani No. 123, Makassar"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: KARIR */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase size={18} className="text-slate-500" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">Jabatan & Pangkat</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <FormInput 
              label="Jabatan" 
              name="jabatan" 
              placeholder="Contoh: Kepala Seksi Umum" 
              required 
            />
            <FormInput 
              label="Tanggal Masuk" 
              name="tanggalMasuk" 
              type="date" 
            />
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Pangkat / Golongan <span className="text-red-500">*</span>
              </label>
              <select 
                name="golongan" 
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none transition-all"
              >
                <option value="">-- Pilih Golongan --</option>
                {listGolongan.map((g) => (
                  <option 
                    key={g.id} 
                    value={g.id}  // ✅ KIRIM ID (UUID)
                  >
                    {g.kode} - {g.nama}  {/* ✅ TAMPILKAN Kode - Nama */}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: JADWAL - GUNAKAN value + onChange untuk TMT */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar size={18} className="text-slate-500" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">Manajemen Jadwal</h3>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* BAGIAN PANGKAT */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Kenaikan Pangkat</h4>
                <button
                  type="button"
                  onClick={handleTogglePangkat}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${
                    isAutoPangkat ? 'bg-[#5E2390] text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {isAutoPangkat ? "● OTOMATIS" : "○ MANUAL"}
                </button>
              </div>
              
              {/* GUNAKAN value + onChange karena butuh logic */}
              <FormInput 
                label="TMT Pangkat Terakhir" 
                name="tmtPangkatTerakhir" 
                type="date" 
                value={tmtPangkat}
                onChange={handleTmtPangkatChange}
                required 
              />

              {isAutoPangkat ? (
                <>
                  <input type="hidden" name="jadwalNaikPangkat" value={jadwalPangkat} />
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Jadwal Naik Pangkat <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jadwalPangkat || "Pilih TMT Pangkat dulu..."}
                      readOnly
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Dihitung otomatis: +{intervalPangkat} tahun dari TMT
                    </p>
                  </div>
                </>
              ) : (
                <FormInput 
                  label="Jadwal Naik Pangkat" 
                  name="jadwalNaikPangkat" 
                  type="date" 
                  value={jadwalPangkat}
                  onChange={(e) => setJadwalPangkat(e.target.value)}
                  required
                  helpText="Mode manual: Anda bebas set tanggal custom"
                />
              )}
            </div>

            {/* BAGIAN GAJI */}
            <div className="space-y-4 border-l border-slate-100 pl-0 md:pl-8">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Kenaikan Gaji Berkala</h4>
                <button
                  type="button"
                  onClick={handleToggleGaji}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${
                    isAutoGaji ? 'bg-[#5E2390] text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {isAutoGaji ? "● OTOMATIS" : "○ MANUAL"}
                </button>
              </div>

              <FormInput 
                label="TMT Gaji Terakhir" 
                name="tmtGajiTerakhir" 
                type="date" 
                value={tmtGaji}
                onChange={handleTmtGajiChange}
                required 
              />

              {isAutoGaji ? (
                <>
                  <input type="hidden" name="jadwalKenaikanGaji" value={jadwalGaji} />
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Jadwal Naik Gaji <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jadwalGaji || "Pilih TMT Gaji dulu..."}
                      readOnly
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Dihitung otomatis: +{intervalGaji} tahun dari TMT
                    </p>
                  </div>
                </>
              ) : (
                <FormInput 
                  label="Jadwal Naik Gaji" 
                  name="jadwalKenaikanGaji" 
                  type="date" 
                  value={jadwalGaji}
                  onChange={(e) => setJadwalGaji(e.target.value)}
                  required
                  helpText="Mode manual: Anda bebas set tanggal custom"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}