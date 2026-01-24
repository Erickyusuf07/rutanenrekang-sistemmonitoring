import { db } from "@/lib/db"
import { WBPPageClient } from "./page-client"

export default async function WBPPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string }>
}) {
    const params = await searchParams
    const query = params.q || ""
    const statusFilter = params.status || ""

    // ✅ AMBIL SEMUA DATA
    const allWBP = await db.wargaBinaan.findMany({
        where: { status: 'AKTIF' }, // ✅ HANYA AMBIL WBP AKTIF
        orderBy: { createdAt: 'desc' }
    })

    // ✅ FILTER DI JAVASCRIPT
    let wbpList = allWBP

    if (query) {
        const lowerQuery = query.toLowerCase()
        wbpList = wbpList.filter(w =>
            w.nama.toLowerCase().includes(lowerQuery) ||
            w.noRegistrasi.toLowerCase().includes(lowerQuery) ||
            w.nik.includes(lowerQuery)
        )
    }

    if (statusFilter) {
        wbpList = wbpList.filter(w => w.statusPenahanan === statusFilter)
    }

    // ✅ HITUNG STATISTIK
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0) // ✅ SET TO MIDNIGHT
    
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999) // ✅ SET TO END OF DAY

    const stats = {
        total: allWBP.length,

        // STATUS PENAHANAN
        mapenaling: allWBP.filter(w => w.statusPenahanan === 'MAPENALING').length,
        normal: allWBP.filter(w => w.statusPenahanan === 'NORMAL').length,
        isolasi: allWBP.filter(w => w.statusPenahanan === 'ISOLASI').length,
        karantina: allWBP.filter(w => w.statusPenahanan === 'KARANTINA').length,

        // ✅ BEBAS BULAN INI (FIX LOGIC)
        bebasBulanIni: allWBP.filter(w => {
            if (!w.tanggalBebas) return false
            
            const bebasDate = new Date(w.tanggalBebas)
            bebasDate.setHours(0, 0, 0, 0) // ✅ NORMALIZE TO MIDNIGHT
            
            return bebasDate >= startOfMonth && bebasDate <= endOfMonth
        }).length,
    }

    return <WBPPageClient wbpList={wbpList} stats={stats} />
}