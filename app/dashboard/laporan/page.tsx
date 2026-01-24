import { Metadata } from "next"
import LaporanClient from "./laporan-client"

export const metadata: Metadata = {
  title: "Laporan | RUTAN Enrekang",
  description: "Generate laporan PDF pegawai dan WBP"
}

export default function LaporanPage() {
  return <LaporanClient />
}