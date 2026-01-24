-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "StatusAktif" AS ENUM ('AKTIF', 'PENSIUN', 'PINDAH');

-- CreateEnum
CREATE TYPE "JenisPidana" AS ENUM ('PIDANA', 'TAHANAN', 'KURUNGAN');

-- CreateEnum
CREATE TYPE "StatusPenahanan" AS ENUM ('MAPENALING', 'NORMAL', 'ISOLASI', 'KARANTINA');

-- CreateEnum
CREATE TYPE "Agama" AS ENUM ('ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU');

-- CreateEnum
CREATE TYPE "StatusWBP" AS ENUM ('AKTIF', 'BEBAS', 'DIPINDAHKAN', 'MENINGGAL');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('LOGIN', 'CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pegawai" (
    "id" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL DEFAULT 'LAKI_LAKI',
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "noTelepon" TEXT,
    "alamat" TEXT,
    "pendidikanTerakhir" TEXT,
    "tanggalMasuk" TIMESTAMP(3),
    "golonganId" TEXT NOT NULL,
    "tmtPangkatTerakhir" TIMESTAMP(3) NOT NULL,
    "jadwalNaikPangkat" TIMESTAMP(3) NOT NULL,
    "tmtGajiTerakhir" TIMESTAMP(3) NOT NULL,
    "jadwalKenaikanGaji" TIMESTAMP(3) NOT NULL,
    "status" "StatusAktif" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Konfigurasi" (
    "id" TEXT NOT NULL DEFAULT 'global-config',
    "tahunKenaikanPangkat" INTEGER NOT NULL DEFAULT 4,
    "tahunKenaikanGaji" INTEGER NOT NULL DEFAULT 2,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Konfigurasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golongan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golongan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warga_binaan" (
    "id" TEXT NOT NULL,
    "noRegistrasi" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "agama" "Agama" NOT NULL DEFAULT 'ISLAM',
    "pendidikan" TEXT,
    "pekerjaan" TEXT,
    "alamat" TEXT,
    "noTeleponKeluarga" TEXT,
    "namaKeluarga" TEXT,
    "perkara" TEXT NOT NULL,
    "jenisPidana" "JenisPidana" NOT NULL DEFAULT 'PIDANA',
    "vonisHukuman" INTEGER NOT NULL,
    "tanggalVonis" TIMESTAMP(3) NOT NULL,
    "namaPengacara" TEXT,
    "tanggalMasuk" TIMESTAMP(3) NOT NULL,
    "durasiMapenaling" INTEGER NOT NULL DEFAULT 14,
    "jadwalSelesaiMapenaling" TIMESTAMP(3) NOT NULL,
    "statusPenahanan" "StatusPenahanan" NOT NULL DEFAULT 'MAPENALING',
    "tanggalBebas" TIMESTAMP(3) NOT NULL,
    "fotoUrl" TEXT,
    "catatanKhusus" TEXT,
    "status" "StatusWBP" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warga_binaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_karutan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "lokasi" TEXT,
    "waktuMulai" TIMESTAMP(3) NOT NULL,
    "waktuSelesai" TIMESTAMP(3),
    "deskripsi" TEXT,
    "isSelesai" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_karutan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "aktivitas" TEXT NOT NULL,
    "tipe" "LogType" NOT NULL,
    "detail" TEXT,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "pegawai_nip_key" ON "pegawai"("nip");

-- CreateIndex
CREATE INDEX "pegawai_jadwalNaikPangkat_idx" ON "pegawai"("jadwalNaikPangkat");

-- CreateIndex
CREATE INDEX "pegawai_jadwalKenaikanGaji_idx" ON "pegawai"("jadwalKenaikanGaji");

-- CreateIndex
CREATE INDEX "pegawai_golonganId_idx" ON "pegawai"("golonganId");

-- CreateIndex
CREATE UNIQUE INDEX "golongan_kode_key" ON "golongan"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "warga_binaan_noRegistrasi_key" ON "warga_binaan"("noRegistrasi");

-- CreateIndex
CREATE UNIQUE INDEX "warga_binaan_nik_key" ON "warga_binaan"("nik");

-- CreateIndex
CREATE INDEX "warga_binaan_jadwalSelesaiMapenaling_idx" ON "warga_binaan"("jadwalSelesaiMapenaling");

-- CreateIndex
CREATE INDEX "warga_binaan_tanggalBebas_idx" ON "warga_binaan"("tanggalBebas");

-- CreateIndex
CREATE INDEX "warga_binaan_statusPenahanan_idx" ON "warga_binaan"("statusPenahanan");

-- AddForeignKey
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_golonganId_fkey" FOREIGN KEY ("golonganId") REFERENCES "golongan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
