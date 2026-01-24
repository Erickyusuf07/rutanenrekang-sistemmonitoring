import { db } from "@/lib/db";

async function showPassword() {
  try {
    const admin = await db.admin.findUnique({
      where: { username: "admin" },
    });

    if (!admin) {
      console.log("❌ Admin tidak ditemukan!");
      return;
    }

    console.log("✅ DATA ADMIN:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Username:", admin.username);
    console.log("Password:", admin.password);
    console.log("Nama:", admin.namaLengkap);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🔐 Login dengan:");
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: ${admin.password}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.$disconnect();
  }
}

showPassword();
