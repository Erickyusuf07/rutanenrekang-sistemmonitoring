'use client'

import { updatePegawai } from "@/actions/pegawai"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle
} from "lucide-react"
import { useActionState, ChangeEvent, useState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"

// --- INTERFACES ---
interface EditPegawaiState {
  error?: string;
  message?: string;
}

interface PegawaiData {
  id: string
  nama: string
  nip: string
  jabatan: string
  golonganId: string  // ✅ Ubah jadi golonganId
  golongan: {         // ✅ Tambahkan object golongan
    id: string
    kode: string
    nama: string
  }
  jenisKelamin: string
  tempatLahir?: string | null
  tanggalLahir?: Date | null
  noTelepon?: string | null
  alamat?: string | null
  pendidikanTerakhir?: string | null
  tanggalMasuk?: Date | null
  tmtPangkatTerakhir: Date
  jadwalNaikPangkat: Date
  tmtGajiTerakhir: Date
  jadwalKenaikanGaji: Date
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
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  helpText?: string
}

// --- HELPER FUNCTIONS ---
const formatDate = (date?: Date | null) => date ? new Date(date).toISOString().split('T')[0] : ""

const formatDateID = (date: Date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
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
      {pending ? "Menyimpan..." : "Simpan Perubahan"}
    </button>
  )
}

function FormInput({ label, name, type = "text", value, onChange, placeholder, required = false, helpText }: FormInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none transition-all"
      />
      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}
    </div>
  )
}

// --- KOMPONEN UTAMA ---
export default function EditPegawaiForm({
  pegawai,
  listGolongan,
  config
}: {
  pegawai: PegawaiData,
  listGolongan: GolonganOption[],
  config: ConfigData | null
}) {
  const [state, formAction] = useActionState<EditPegawaiState | null, FormData>(updatePegawai, null);
  const router = useRouter();
  const isRedirecting = useRef(false);

  const intervalPangkat = config?.tahunKenaikanPangkat || 4
  const intervalGaji = config?.tahunKenaikanGaji || 2

  // HELPER: Cek apakah jadwal otomatis atau manual
  const isScheduleAuto = (tmt: Date, jadwal: Date, interval: number): boolean => {
    const expectedDate = new Date(tmt);
    expectedDate.setFullYear(expectedDate.getFullYear() + interval);
    const expected = expectedDate.toISOString().split('T')[0];
    const actual = new Date(jadwal).toISOString().split('T')[0];
    return expected === actual;
  }

  // HELPER: Cek status jatuh tempo dengan ICON
  const getScheduleStatus = (jadwal: Date) => {
    const today = new Date();
    const jadwalDate = new Date(jadwal);
    const diffDays = Math.floor((jadwalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < -90) {
      return {
        status: 'urgent',
        text: 'TERLAMBAT',
        icon: XCircle,
        color: 'bg-red-100 text-red-700 border-red-300'
      };
    }
    if (diffDays < 0) {
      return {
        status: 'warning',
        text: 'JATUH TEMPO',
        icon: AlertTriangle,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300'
      };
    }
    if (diffDays < 30) {
      return {
        status: 'soon',
        text: 'SEGERA',
        icon: Clock,
        color: 'bg-orange-100 text-orange-700 border-orange-300'
      };
    }
    return {
      status: 'ok',
      text: 'AKTIF',
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-700 border-green-300'
    };
  }

  const statusPangkat = getScheduleStatus(pegawai.jadwalNaikPangkat);
  const statusGaji = getScheduleStatus(pegawai.jadwalKenaikanGaji);

  // State untuk Data Form Umum
  const [formData, setFormData] = useState({
    nama: pegawai.nama,
    nip: pegawai.nip,
    jabatan: pegawai.jabatan,
    golongan: pegawai.golongan,
    jenisKelamin: pegawai.jenisKelamin,
    tempatLahir: pegawai.tempatLahir || "",
    tanggalLahir: formatDate(pegawai.tanggalLahir),
    noTelepon: pegawai.noTelepon || "",
    alamat: pegawai.alamat || "",
    pendidikanTerakhir: pegawai.pendidikanTerakhir || "",
    tanggalMasuk: formatDate(pegawai.tanggalMasuk),
    tmtPangkatTerakhir: formatDate(pegawai.tmtPangkatTerakhir),
    tmtGajiTerakhir: formatDate(pegawai.tmtGajiTerakhir),
  })

  // State Khusus Jadwal & Mode Otomatis (AUTO-DETECT!)
  const [jadwalPangkat, setJadwalPangkat] = useState(formatDate(pegawai.jadwalNaikPangkat));
  const [jadwalGaji, setJadwalGaji] = useState(formatDate(pegawai.jadwalKenaikanGaji));

  const [isAutoPangkat, setIsAutoPangkat] = useState(
    isScheduleAuto(pegawai.tmtPangkatTerakhir, pegawai.jadwalNaikPangkat, intervalPangkat)
  );

  const [isAutoGaji, setIsAutoGaji] = useState(
    isScheduleAuto(pegawai.tmtGajiTerakhir, pegawai.jadwalKenaikanGaji, intervalGaji)
  );

  const handleChange = (field: string) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  // Logic TMT Pangkat
  const handleTmtPangkatChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData({ ...formData, tmtPangkatTerakhir: val })

    if (val && isAutoPangkat) {
      const date = new Date(val)
      date.setFullYear(date.getFullYear() + intervalPangkat)
      setJadwalPangkat(date.toISOString().split('T')[0])
    }
  }

  // Logic TMT Gaji
  const handleTmtGajiChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData({ ...formData, tmtGajiTerakhir: val })

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

    if (newMode && formData.tmtPangkatTerakhir) {
      const date = new Date(formData.tmtPangkatTerakhir);
      date.setFullYear(date.getFullYear() + intervalPangkat);
      setJadwalPangkat(date.toISOString().split('T')[0]);
    }
  }

  // Toggle Gaji
  const handleToggleGaji = () => {
    const newMode = !isAutoGaji;
    setIsAutoGaji(newMode);

    if (newMode && formData.tmtGajiTerakhir) {
      const date = new Date(formData.tmtGajiTerakhir);
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
          <h1 className="text-xl font-bold text-slate-900">Edit Data Pegawai</h1>
          <p className="text-xs text-slate-500">Perbarui data administrasi dan jadwal berkala</p>
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

      {/* ALERT JATUH TEMPO - MODERN DESIGN */}
      {(statusPangkat.status !== 'ok' || statusGaji.status !== 'ok') && (
        <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <AlertCircle size={20} className="text-orange-600" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-orange-900">Peringatan Jadwal Kenaikan</h3>
                <p className="text-xs text-orange-700 mt-0.5">Pegawai ini memiliki jadwal yang perlu perhatian:</p>
              </div>

              <div className="space-y-2">
                {statusPangkat.status !== 'ok' && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/60 border border-orange-200 px-3 py-2">
                    <statusPangkat.icon size={16} className="text-orange-600" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">Kenaikan Pangkat</p>
                      <p className="text-[10px] text-slate-600">
                        {statusPangkat.text} pada <strong>{formatDateID(pegawai.jadwalNaikPangkat)}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {statusGaji.status !== 'ok' && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/60 border border-orange-200 px-3 py-2">
                    <statusGaji.icon size={16} className="text-orange-600" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">Kenaikan Gaji Berkala</p>
                      <p className="text-[10px] text-slate-600">
                        {statusGaji.text} pada <strong>{formatDateID(pegawai.jadwalKenaikanGaji)}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-orange-700 bg-orange-100/50 rounded-lg px-3 py-2 border border-orange-200">
                <Calendar size={12} />
                <span>Silakan update TMT terbaru jika pegawai sudah naik pangkat/gaji</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={pegawai.id} />

        {/* SECTION 1: PERSONAL */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-slate-500" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">Identitas Personal</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <FormInput label="Nama Lengkap" name="nama" value={formData.nama} onChange={handleChange('nama')} required />
            <FormInput label="NIP" name="nip" value={formData.nip} onChange={handleChange('nip')} required />

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Tempat Lahir" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange('tempatLahir')} />
              <FormInput label="Tanggal Lahir" name="tanggalLahir" type="date" value={formData.tanggalLahir} onChange={handleChange('tanggalLahir')} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Jenis Kelamin</label>
              <select
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleChange('jenisKelamin')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none transition-all"
              >
                <option value="LAKI_LAKI">Laki-Laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>

            <FormInput label="Nomor Telepon" name="noTelepon" value={formData.noTelepon} onChange={handleChange('noTelepon')} />
            <FormInput label="Pendidikan Terakhir" name="pendidikanTerakhir" value={formData.pendidikanTerakhir} onChange={handleChange('pendidikanTerakhir')} />

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Alamat</label>
              <textarea
                name="alamat"
                value={formData.alamat || ""}
                onChange={handleChange('alamat')}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none transition-all"
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
            <FormInput label="Jabatan" name="jabatan" value={formData.jabatan} onChange={handleChange('jabatan')} required />
            <FormInput label="Tanggal Masuk" name="tanggalMasuk" type="date" value={formData.tanggalMasuk} onChange={handleChange('tanggalMasuk')} />

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Pangkat / Golongan</label>
              <select
                name="golongan"
                defaultValue={pegawai.golonganId}  // ✅ GUNAKAN golonganId (UUID)
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-black"
              >
                <option value="">-- Pilih Golongan --</option>
                {listGolongan.map(gol => (
                  <option key={gol.id} value={gol.id}>
                    {gol.kode} - {gol.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: JADWAL - WITH STATUS BADGE */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar size={18} className="text-slate-500" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">Manajemen Jadwal</h3>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* BAGIAN PANGKAT */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Kenaikan Pangkat</h4>
                  {/* STATUS BADGE WITH ICON */}
                  <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border ${statusPangkat.color}`}>
                    <statusPangkat.icon size={10} />
                    {statusPangkat.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePangkat}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${isAutoPangkat ? 'bg-[#5E2390] text-white' : 'bg-slate-100 text-slate-900'
                    }`}
                >
                  {isAutoPangkat ? "● OTOMATIS" : "○ MANUAL"}
                </button>
              </div>

              <FormInput
                label="TMT Pangkat Terakhir"
                name="tmtPangkatTerakhir"
                type="date"
                value={formData.tmtPangkatTerakhir}
                onChange={handleTmtPangkatChange}
                required
              />

              {isAutoPangkat ? (
                <>
                  <input type="hidden" name="jadwalNaikPangkat" value={jadwalPangkat} />
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Jadwal Naik Pangkat</label>
                    <input
                      type="text"
                      value={jadwalPangkat || "Pilih TMT dulu..."}
                      readOnly
                      disabled
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Dihitung otomatis: +{intervalPangkat} tahun
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
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Kenaikan Gaji Berkala</h4>
                  {/* STATUS BADGE WITH ICON */}
                  <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border ${statusGaji.color}`}>
                    <statusGaji.icon size={10} />
                    {statusGaji.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleGaji}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${isAutoGaji ? 'bg-[#5E2390] text-white' : 'bg-slate-100 text-slate-900'
                    }`}
                >
                  {isAutoGaji ? "● OTOMATIS" : "○ MANUAL"}
                </button>
              </div>

              <FormInput
                label="TMT Gaji Terakhir"
                name="tmtGajiTerakhir"
                type="date"
                value={formData.tmtGajiTerakhir}
                onChange={handleTmtGajiChange}
                required
              />

              {isAutoGaji ? (
                <>
                  <input type="hidden" name="jadwalKenaikanGaji" value={jadwalGaji} />
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Jadwal Naik Gaji</label>
                    <input
                      type="text"
                      value={jadwalGaji || "Pilih TMT dulu..."}
                      readOnly
                      disabled
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Dihitung otomatis: +{intervalGaji} tahun
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