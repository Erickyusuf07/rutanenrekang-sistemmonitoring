'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarClock,
  History,
  LogOut,
  Layers,
  Settings,
  Bell,
  FileText,
  Monitor,
  Megaphone
} from "lucide-react"
import { logoutAction } from "@/actions/auth"
import { useEffect, useState } from "react"
import Image from "next/image"
// Menu items
const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pengumuman", href: "/dashboard/pengumuman", icon: Bell, badge: true },
  { label: "Manajemen Pegawai", href: "/dashboard/pegawai", icon: UserCog },
  { label: "Golongan", href: "/dashboard/golongan", icon: Layers },
  { label: "Data Warga Binaan", href: "/dashboard/wbp", icon: Users },
  { label: "Agenda Karutan", href: "/dashboard/agenda", icon: CalendarClock },
  { label: "Laporan", href: "/dashboard/laporan", icon: FileText },
  { label: "Riwayat Aktivitas", href: "/dashboard/history", icon: History },
  {
    href: "/dashboard/display-settings",
    icon: Monitor,
    label: "Display TV",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    href: "/dashboard/pengumuman-display",
    icon: Megaphone,
    label: "Pengumuman Display",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  { label: "Pengaturan", href: "/dashboard/pengaturan", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [notifCount, setNotifCount] = useState(0)

  // Fetch notifikasi count
  useEffect(() => {
    async function fetchNotifCount() {
      try {
        const res = await fetch('/api/notifikasi/count')

        // Check if response is OK
        if (!res.ok) {
          console.error('API returned error:', res.status)
          return
        }

        // Check content-type
        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error('Response is not JSON')
          return
        }

        const data = await res.json()
        setNotifCount(data.count || 0)
      } catch (error) {
        console.error('Failed to fetch notification count:', error)
        setNotifCount(0)
      }
    }

    fetchNotifCount()

    // Refresh setiap 30 detik
    const interval = setInterval(fetchNotifCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Header Sidebar */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg">
          <div className="relative w-10 h-10">
            <Image
              src="/logo.png"
              alt="Logo Rutan Enrekang"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800">RUTAN ENREKANG</h1>
          <p className="text-[10px] text-slate-500">Panel Administrator</p>
        </div>
      </div>

      {/* Menu List */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all relative ${isActive
                ? "bg-[#5E2390] text-white shadow-md shadow-purple-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-[#5E2390]"
                }`}
            >
              <Icon size={18} />
              <span className="flex-1">{item.label}</span>

              {/* BADGE NOTIFIKASI */}
              {item.badge && notifCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white animate-pulse">
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Tombol Logout */}
      <div className="border-t border-slate-100 p-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={18} />
            Keluar Sistem
          </button>
        </form>
      </div>
    </div>
  )
}