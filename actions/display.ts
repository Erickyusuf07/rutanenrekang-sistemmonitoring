"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { createLog } from "./system-log";
import { LogType } from "@prisma/client";

// ========================================
// GET DISPLAY SETTINGS
// ========================================
export async function getDisplaySettings() {
  try {
    const settings = await db.displaySetting.findUnique({
      where: { id: "display-config" },
    });

    if (!settings) {
      // Create default settings
      return await db.displaySetting.create({
        data: {
          id: "display-config",
          isPublic: false,
          refreshInterval: 30,
          showAgenda: true,
          showKenaikanGaji: true,
          showKenaikanPangkat: true,
          showPembebasan: true,
          showMapenaling: true,
          showPengumuman: true,
          filterHariKedepan: 30,
          layoutMode: "GRID",
          itemsPerPage: 10,
          displayTitle: "RUTAN ENREKANG - SISTEM MONITORING",
          primaryColor: "#5E2390",
          backgroundColor: "#FFFFFF",
        },
      });
    }

    return settings;
  } catch (error) {
    console.error("Error fetching display settings:", error);
    return null;
  }
}

// ========================================
// GET DISPLAY DATA (PUBLIC/PRIVATE)
// ========================================
export async function getDisplayData() {
  try {
    const settings = await getDisplaySettings();

    if (!settings) {
      return {
        success: false,
        error: "Pengaturan display belum diinisialisasi",
      };
    }

    // ✅ CEK AKSES
    if (!settings.isPublic) {
      const session = await auth();
      if (!session) {
        return {
          success: false,
          error:
            "Display TV memerlukan login. Hubungi admin untuk akses publik.",
        };
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + settings.filterHariKedepan);
    futureDate.setHours(23, 59, 59, 999);
    // ✅ FETCH DATA PARALEL
    const [
      agendaList,
      pegawaiGaji,
      pegawaiPangkat,
      wbpBebas,
      wbpMapenaling,
      pengumumanList,
    ] = await Promise.all([
      // 1. AGENDA KARUTAN
      settings.showAgenda
        ? db.agendaKarutan.findMany({
            where: {
              isSelesai: false,
              waktuMulai: { gte: today, lte: futureDate },
            },
            orderBy: { waktuMulai: "asc" },
            take: settings.itemsPerPage,
          })
        : [],

      // 2. PEGAWAI - KENAIKAN GAJI
      settings.showKenaikanGaji
        ? db.pegawai.findMany({
            where: {
              status: "AKTIF",
              jadwalKenaikanGaji: { gte: today, lte: futureDate },
            },
            include: { golongan: true },
            orderBy: { jadwalKenaikanGaji: "asc" },
            take: settings.itemsPerPage,
          })
        : [],

      // 3. PEGAWAI - KENAIKAN PANGKAT
      settings.showKenaikanPangkat
        ? db.pegawai.findMany({
            where: {
              status: "AKTIF",
              jadwalNaikPangkat: { gte: today, lte: futureDate },
            },
            include: { golongan: true },
            orderBy: { jadwalNaikPangkat: "asc" },
            take: settings.itemsPerPage,
          })
        : [],

      // 4. WBP - JADWAL BEBAS
      settings.showPembebasan
        ? db.wargaBinaan.findMany({
            where: {
              status: "AKTIF",
              tanggalBebas: {
                not: null,
                gte: today,
                lte: futureDate,
              },
            },
            orderBy: { tanggalBebas: "asc" },
            take: settings.itemsPerPage,
          })
        : [],

      // 5. WBP - MAPENALING
      settings.showMapenaling
        ? db.wargaBinaan.findMany({
            where: {
              status: "AKTIF",
              statusPenahanan: "MAPENALING",
              jadwalSelesaiMapenaling: { gte: today, lte: futureDate },
            },
            orderBy: { jadwalSelesaiMapenaling: "asc" },
            take: settings.itemsPerPage,
          })
        : [],

      // 6. PENGUMUMAN
      settings.showPengumuman
        ? db.pengumuman.findMany({
            where: { isActive: true },
            orderBy: [{ isPriority: "desc" }, { createdAt: "desc" }],
            take: 5,
          })
        : [],
    ]);

    return {
      success: true,
      settings,
      data: {
        agenda: agendaList,
        kenaikanGaji: pegawaiGaji,
        kenaikanPangkat: pegawaiPangkat,
        pembebasan: wbpBebas,
        mapenaling: wbpMapenaling,
        pengumuman: pengumumanList,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching display data:", error);
    return {
      success: false,
      error: "Gagal memuat data display",
    };
  }
}

// ========================================
// UPDATE DISPLAY SETTINGS
// ========================================
export async function updateDisplaySettings(
  prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const data = {
      // Gunakan .has() untuk checkbox agar lebih akurat
      isPublic: formData.has("isPublic"),
      showAgenda: formData.has("showAgenda"),
      showKenaikanGaji: formData.has("showKenaikanGaji"),
      showKenaikanPangkat: formData.has("showKenaikanPangkat"),
      showPembebasan: formData.has("showPembebasan"),
      showMapenaling: formData.has("showMapenaling"),
      showPengumuman: formData.has("showPengumuman"),
      
      // Untuk select dan input text/number
      refreshInterval: parseInt(formData.get("refreshInterval") as string) || 30,
      filterHariKedepan: parseInt(formData.get("filterHariKedepan") as string) || 30,
      itemsPerPage: parseInt(formData.get("itemsPerPage") as string) || 10,
      layoutMode: formData.get("layoutMode") as "GRID" | "LIST" | "CAROUSEL",
      displayTitle: formData.get("displayTitle") as string,
      primaryColor: formData.get("primaryColor") as string,
      backgroundColor: formData.get("backgroundColor") as string,
    };

    await db.displaySetting.upsert({
      where: { id: "display-config" },
      update: data,
      create: { id: "display-config", ...data },
    });

    await createLog(
      "Mengubah pengaturan Display TV",
      LogType.UPDATE,
      JSON.stringify({ isPublic: data.isPublic, layoutMode: data.layoutMode })
    );

    revalidatePath("/dashboard/display-settings");
    revalidatePath("/display");

    return { success: "✅ Pengaturan Display TV berhasil diperbarui!" };
  } catch (error) {
    console.error("Error updating display settings:", error);
    return { error: "❌ Gagal memperbarui pengaturan!" };
  }
}