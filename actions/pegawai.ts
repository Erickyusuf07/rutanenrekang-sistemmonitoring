// actions/pegawai.ts
"use server";

import { db } from "@/lib/db";
import { JenisKelamin } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createLog } from "./system-log"
import { LogType } from "@prisma/client"
// Tipe Data Aman
export type PegawaiState = {
  error?: string;
  message?: string;
} | null;
export interface ImportPegawaiData {
  nama: string;
  nip: string | number;
  jabatan: string;
  golongan: string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  tmtPangkatTerakhir: string;
  jadwalNaikPangkat: string;
  tmtGajiTerakhir: string;
  jadwalKenaikanGaji: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  noTelepon?: string;
  alamat?: string;
  pendidikanTerakhir?: string;
  tanggalMasuk?: string;
}
function calculateSchedule(tmtDate: Date, years: number): Date {
  const result = new Date(tmtDate);
  result.setFullYear(result.getFullYear() + years);
  return result;
}
// 1. CREATE PEGAWAI
export async function createPegawai(
  prevState: PegawaiState,
  formData: FormData
) {
  const nama = formData.get("nama") as string;
  const nip = formData.get("nip") as string;
  const jabatan = formData.get("jabatan") as string;
  const golongan = formData.get("golongan") as string; // Value ini nanti dari Dropdown Dinamis

  const jenisKelamin = formData.get("jenisKelamin") as
    | "LAKI_LAKI"
    | "PEREMPUAN";
  const tempatLahir = formData.get("tempatLahir") as string;
  const tanggalLahirStr = formData.get("tanggalLahir") as string;
  const noTelepon = formData.get("noTelepon") as string;
  const alamat = formData.get("alamat") as string;
  const pendidikanTerakhir = formData.get("pendidikanTerakhir") as string;
  const tanggalMasukStr = formData.get("tanggalMasuk") as string;

  const tmtPangkatStr = formData.get("tmtPangkatTerakhir") as string;
  const jadwalPangkatStr = formData.get("jadwalNaikPangkat") as string;
  const tmtGajiStr = formData.get("tmtGajiTerakhir") as string;
  const jadwalGajiStr = formData.get("jadwalKenaikanGaji") as string;

  // Validasi
  const nipRegex = /^[0-9]+$/;
  if (!nip || nip.length < 5 || !nipRegex.test(nip)) {
    return { error: "NIP Tidak Valid! Harus angka minimal 5 digit." };
  }
  if (!nama || !jabatan || !golongan) {
    return {
      error: "Data Identitas / Jabatan / Golongan wajib diisi lengkap.",
    };
  }
  if (!tmtPangkatStr || !jadwalPangkatStr || !tmtGajiStr || !jadwalGajiStr) {
    return { error: "Semua tanggal wajib diisi." };
  }

  try {
    const pegawai = await db.pegawai.create({
      data: {
        nip,
        nama,
        jabatan,
        golongan: {
          connect: { id: golongan },
        },
        jenisKelamin,
        tempatLahir,
        tanggalLahir: tanggalLahirStr ? new Date(tanggalLahirStr) : null,
        noTelepon,
        alamat,
        pendidikanTerakhir,
        tanggalMasuk: tanggalMasukStr ? new Date(tanggalMasukStr) : null,
        tmtPangkatTerakhir: new Date(tmtPangkatStr),
        jadwalNaikPangkat: new Date(jadwalPangkatStr),
        tmtGajiTerakhir: new Date(tmtGajiStr),
        jadwalKenaikanGaji: new Date(jadwalGajiStr),
        status: "AKTIF",
      },
    });

    await createLog(
      `Menambahkan pegawai baru: ${pegawai.nama}`,
      "CREATE",
      JSON.stringify({ nip: pegawai.nip, nama: pegawai.nama })
    )

    revalidatePath("/dashboard/pegawai");

    // HAPUS redirect(), GANTI dengan return message
    // redirect("/dashboard/pegawai"); ❌ HAPUS INI
    return { message: "Data pegawai berhasil ditambahkan!" }; // ✅ TAMBAHKAN INI
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return { error: "NIP sudah terdaftar!" };
    }
    console.error(err);
    return { error: "Gagal menyimpan data pegawai." };
  }
}

// 2. UPDATE PEGAWAI (FITUR BARU)
export async function updatePegawai(
  prevState: PegawaiState,
  formData: FormData
) {
  const id = formData.get("id") as string;
  const nama = formData.get("nama") as string;
  const nip = formData.get("nip") as string;
  const jabatan = formData.get("jabatan") as string;
  const golongan = formData.get("golongan") as string;

  // Data Baru
  const jenisKelamin = formData.get("jenisKelamin") as
    | "LAKI_LAKI"
    | "PEREMPUAN";
  const tempatLahir = formData.get("tempatLahir") as string;
  const tanggalLahirStr = formData.get("tanggalLahir") as string;
  const noTelepon = formData.get("noTelepon") as string;
  const alamat = formData.get("alamat") as string;
  const pendidikanTerakhir = formData.get("pendidikanTerakhir") as string;
  const tanggalMasukStr = formData.get("tanggalMasuk") as string;

  const tmtPangkatStr = formData.get("tmtPangkatTerakhir") as string;
  const jadwalPangkatStr = formData.get("jadwalNaikPangkat") as string;
  const tmtGajiStr = formData.get("tmtGajiTerakhir") as string;
  const jadwalGajiStr = formData.get("jadwalKenaikanGaji") as string;

  if (!id || !nama || !nip) {
    return { error: "Data korup. ID/Nama/NIP hilang." };
  }

  try {
    // ✅ VALIDASI 1: CEK GOLONGAN EXIST
    console.log('🔍 Validating golongan:', golongan)
    
    const golonganExist = await db.golongan.findUnique({
      where: { id: golongan }
    })
    
    if (!golonganExist) {
      console.error('❌ Golongan not found:', golongan)
      return { 
        error: `Golongan tidak valid! ID: ${golongan.substring(0, 8)}... tidak ditemukan di database.` 
      }
    }

    console.log('✅ Golongan valid:', golonganExist.kode, golonganExist.nama)

    // ✅ VALIDASI 2: CEK NIP UNIK
    const existing = await db.pegawai.findFirst({
      where: { 
        nip, 
        NOT: { id } 
      }
    })
    
    if (existing) {
      return { 
        error: `NIP ${nip} sudah dipakai pegawai lain (${existing.nama}).` 
      }
    }

    // ✅ UPDATE PEGAWAI
    console.log('🚀 Updating pegawai with golonganId:', golongan)

    const pegawai = await db.pegawai.update({
      where: { id },
      data: {
        nip,
        nama,
        jabatan,
        golonganId: golongan,
        jenisKelamin,
        tempatLahir,
        tanggalLahir: tanggalLahirStr ? new Date(tanggalLahirStr) : null,
        noTelepon,
        alamat,
        pendidikanTerakhir,
        tanggalMasuk: tanggalMasukStr ? new Date(tanggalMasukStr) : null,
        tmtPangkatTerakhir: new Date(tmtPangkatStr),
        jadwalNaikPangkat: new Date(jadwalPangkatStr),
        tmtGajiTerakhir: new Date(tmtGajiStr),
        jadwalKenaikanGaji: new Date(jadwalGajiStr),
      },
    });
    await createLog(
      `Mengubah data pegawai: ${pegawai.nama}`,
      "UPDATE",
      JSON.stringify({ nip: pegawai.nip, nama: pegawai.nama })
    )
    revalidatePath("/dashboard/pegawai");

    return { message: "Data pegawai berhasil diperbarui!" }; // ✅ TAMBAHKAN INI
  } catch (err) {
    console.error(err);
    return { error: "Gagal memperbarui data." };
  }
}

// 3. DELETE
export async function deletePegawai(id: string) {
  try {
    // ✅ AMBIL DATA PEGAWAI SEBELUM DIHAPUS (untuk log)
    const pegawai = await db.pegawai.findUnique({
      where: { id },
      select: { nama: true, nip: true }
    });

    await db.pegawai.delete({ where: { id } });

    // ✅ LOG AKTIVITAS DELETE
    if (pegawai) {
      await createLog(
        `Menghapus pegawai: ${pegawai.nama}`,
        "DELETE",
        JSON.stringify({ nip: pegawai.nip })
      )
    }

    revalidatePath("/dashboard/pegawai");
    return { success: true, message: "Data berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleting pegawai:", error);
    throw new Error("Gagal menghapus data pegawai!");
  }
}

// 4. IMPORT DATA PEGAWAI DARI EXCEL
export async function importPegawai(data: ImportPegawaiData[]) {
  try {
    const config = await db.konfigurasi.findFirst();
    const intervalPangkat = config?.tahunKenaikanPangkat || 4;
    const intervalGaji = config?.tahunKenaikanGaji || 2;

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const item of data) {
      try {
        const nipString = String(item.nip).replace(/[^0-9]/g, ''); // ✅ BERSIHKAN FORMAT EXCEL (1,99001E+17 → 199001...)
        
        if (!nipString || nipString.length < 5) {
          skippedCount++;
          errors.push(`Baris "${item.nama}": NIP tidak valid`);
          continue;
        }

        // ✅ RESOLVE GOLONGAN: Cari ID berdasarkan KODE
        const golonganRecord = await db.golongan.findFirst({
          where: { kode: item.golongan } // Cari berdasarkan "II/a", "III/b", dll
        });

        if (!golonganRecord) {
          skippedCount++;
          errors.push(`Baris "${item.nama}": Golongan "${item.golongan}" tidak ditemukan di database`);
          continue;
        }

        const jkConverted = item.jenisKelamin === "PEREMPUAN" 
          ? JenisKelamin.PEREMPUAN 
          : JenisKelamin.LAKI_LAKI;

        const toDate = (val: string | undefined) => (val ? new Date(val) : null);

        const tmtPangkat = new Date(item.tmtPangkatTerakhir);
        const tmtGaji = new Date(item.tmtGajiTerakhir);

        const jadwalPangkat = item.jadwalNaikPangkat
          ? new Date(item.jadwalNaikPangkat)
          : calculateSchedule(tmtPangkat, intervalPangkat);

        const jadwalGaji = item.jadwalKenaikanGaji
          ? new Date(item.jadwalKenaikanGaji)
          : calculateSchedule(tmtGaji, intervalGaji);

        const existing = await db.pegawai.findUnique({
          where: { nip: nipString },
        });

        const payload = {
          nama: item.nama,
          jabatan: item.jabatan,
          golonganId: golonganRecord.id, // ✅ PAKAI ID, BUKAN KODE
          jenisKelamin: jkConverted,
          tempatLahir: item.tempatLahir || null,
          tanggalLahir: toDate(item.tanggalLahir),
          noTelepon: item.noTelepon || null,
          alamat: item.alamat || null,
          pendidikanTerakhir: item.pendidikanTerakhir || null,
          tanggalMasuk: toDate(item.tanggalMasuk),
          tmtPangkatTerakhir: tmtPangkat,
          jadwalNaikPangkat: jadwalPangkat,
          tmtGajiTerakhir: tmtGaji,
          jadwalKenaikanGaji: jadwalGaji,
        };

        if (existing) {
          await db.pegawai.update({
            where: { nip: nipString },
            data: payload,
          });
          updatedCount++;
        } else {
          await db.pegawai.create({
            data: {
              ...payload,
              nip: nipString,
              status: "AKTIF",
            },
          });
          createdCount++;
        }
      } catch (itemError) {
        skippedCount++;
        errors.push(`Baris "${item.nama}": ${itemError instanceof Error ? itemError.message : 'Error tidak diketahui'}`);
      }
    }

    await createLog(
        `Import data pegawai: ${createdCount} ditambahkan, ${updatedCount} diperbarui, ${skippedCount} dilewati`,
        LogType.IMPORT, // ✅ GUNAKAN ENUM EXPLICIT
        JSON.stringify({ 
          createdCount, 
          updatedCount, 
          skippedCount, 
          totalRows: data.length,
          errorSample: errors.slice(0, 3)
        })
      );
      console.log("✅ Import log created successfully")

    revalidatePath("/dashboard/pegawai");

    if (errors.length > 0) {
      return {
        message: `Selesai: ${createdCount} ditambahkan, ${updatedCount} diperbarui.\n\n⚠️ ${skippedCount} data dilewati:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... dan ${errors.length - 5} error lainnya` : ''}`,
      };
    }

    return {
      message: `Import berhasil! ${createdCount} data ditambahkan, ${updatedCount} data diperbarui.`,
    };
  } catch (error) {
    console.error("Import Error:", error);
    return {
      error: "Terjadi kesalahan sistem saat memproses data. Hubungi administrator.",
    };
  }
}