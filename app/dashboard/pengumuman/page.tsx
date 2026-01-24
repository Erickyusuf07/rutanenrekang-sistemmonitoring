import { db } from "@/lib/db"
import PengumumanList from "./pengumuman-list"

export const metadata = {
  title: "Pengumuman | RUTAN Enrekang",
  description: "Monitor kenaikan pegawai dan jadwal bebas WBP"
}

export default async function PengumumanPage() {
  // ✅ PARALEL FETCH (OPTIMASI RAM) - Fetch data secara bersamaan
  const [pegawaiList, wbpList] = await Promise.all([
    // 📌 FETCH PEGAWAI (LENGKAP UNTUK MODAL) - ✅ TAMBAH FIELD UNTUK MODAL
    db.pegawai.findMany({
      where: { status: "AKTIF" },
      select: {
        id: true,
        nama: true,
        nip: true,
        jabatan: true,
        golonganId: true, // ✅ BARU: Untuk modal
        golongan: {
          select: {
            id: true,
            kode: true,
            nama: true
          }
        },
        jenisKelamin: true, // ✅ BARU: Untuk modal
        tempatLahir: true, // ✅ BARU: Untuk modal
        tanggalLahir: true, // ✅ BARU: Untuk modal
        noTelepon: true, // ✅ BARU: Untuk modal
        alamat: true, // ✅ BARU: Untuk modal
        pendidikanTerakhir: true, // ✅ BARU: Untuk modal
        tanggalMasuk: true, // ✅ BARU: Untuk modal
        jadwalNaikPangkat: true,
        jadwalKenaikanGaji: true,
        tmtPangkatTerakhir: true,
        tmtGajiTerakhir: true,
        status: true, // ✅ BARU: Untuk modal
      },
      orderBy: { jadwalNaikPangkat: 'asc' },
    }),

    // 📌 FETCH WBP (LENGKAP UNTUK MODAL) - ✅ TAMBAH SEMUA FIELD
    db.wargaBinaan.findMany({
      where: {
        status: "AKTIF",
        tanggalBebas: {
          not: null,
          gte: new Date()
        }
      },
      select: {
        // ✅ SEMUA FIELD UNTUK MODAL DETAIL
        id: true,
        createdAt: true,
        updatedAt: true,
        noRegistrasi: true,
        nik: true,
        nama: true,
        jenisKelamin: true,
        tempatLahir: true,
        tanggalLahir: true,
        agama: true,
        pendidikan: true,
        pekerjaan: true,
        alamat: true,
        namaKeluarga: true,
        noTeleponKeluarga: true,
        perkara: true,
        jenisPidana: true,
        vonisHukuman: true,
        tanggalVonis: true,
        namaPengacara: true,
        tanggalMasuk: true,
        jadwalSelesaiMapenaling: true,
        tanggalBebas: true,
        statusPenahanan: true,
        status: true,
        catatanKhusus: true,
        durasiMapenaling: true,
        fotoUrl: true,
      },
      orderBy: { tanggalBebas: 'asc' },
      take: 100
    })
  ])

  // ✅ HITUNG STATISTIK PEGAWAI
  const today = new Date()
  const statsPegawai = {
    total: pegawaiList.length,
    urgent: 0,
    jatuhTempo: 0,
    segera: 0,
  }

  pegawaiList.forEach((p) => {
    const diffPangkat = Math.floor((new Date(p.jadwalNaikPangkat).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const diffGaji = Math.floor((new Date(p.jadwalKenaikanGaji).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffPangkat < -90 || diffGaji < -90) statsPegawai.urgent++
    else if (diffPangkat < 0 || diffGaji < 0) statsPegawai.jatuhTempo++
    else if (diffPangkat < 30 || diffGaji < 30) statsPegawai.segera++
  })

  // ✅ HITUNG STATISTIK WBP
  const statsWBP = {
    total: wbpList.length,
    urgent: 0,
    segera: 0,
    normal: 0,
  }

  wbpList.forEach((w) => {
    if (!w.tanggalBebas) return
    
    const diffDays = Math.floor((new Date(w.tanggalBebas).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) statsWBP.urgent++
    else if (diffDays < 30) statsWBP.segera++
    else statsWBP.normal++
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-slate-100 p-6">
      <PengumumanList 
        pegawaiList={pegawaiList} 
        statsPegawai={statsPegawai}
        wbpList={wbpList}
        statsWBP={statsWBP}
      />
    </div>
  )
}