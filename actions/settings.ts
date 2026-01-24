// actions/settings.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createLog } from "./system-log";
// Perbaikan: Ganti 'any' dengan tipe yang spesifik
export type SettingsState = {
  success?: string;
  error?: string;
} | null;

export async function updateConfig(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const pangkat = parseInt(formData.get("tahunKenaikanPangkat") as string);
  const gaji = parseInt(formData.get("tahunKenaikanGaji") as string);

  try {
    await db.konfigurasi.upsert({
      where: { id: "global-config" },
      update: { tahunKenaikanPangkat: pangkat, tahunKenaikanGaji: gaji },
      create: {
        id: "global-config",
        tahunKenaikanPangkat: pangkat,
        tahunKenaikanGaji: gaji,
      },
    });
    await createLog(
      `Mengubah konfigurasi sistem`,
      "UPDATE",
      JSON.stringify({ pangkat, gaji })
    )
    revalidatePath("/dashboard/pengaturan");
    return { success: "Konfigurasi berhasil diperbarui!" };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
    // Perbaikan: Gunakan '_err' jika tidak dipakai untuk menghindari lint error
    return { error: "Gagal menyimpan data." };
  }
}
