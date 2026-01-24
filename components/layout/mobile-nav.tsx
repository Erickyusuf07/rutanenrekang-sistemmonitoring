'use client'

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, UserCircle } from "lucide-react"
import {
  Menu,
  X,
  Home,
  Users,
  Scale,
  Calendar,
  Settings,
  Megaphone,
  Activity,
  FileText,
  Monitor,
} from "lucide-react"
import { logoutAction } from "@/actions/auth"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Data Pegawai", href: "/dashboard/pegawai" },
  { icon: Scale, label: "Golongan", href: "/dashboard/golongan" },
  { icon: Users, label: "Data WBP", href: "/dashboard/wbp" },
  { icon: Calendar, label: "Agenda", href: "/dashboard/agenda" },
  { icon: Megaphone, label: "Pengumuman", href: "/dashboard/pengumuman", badge: true }, // ✅ TAMBAHKAN badge
  { icon: FileText, label: "Laporan", href: "/dashboard/laporan" },
  { icon: Activity, label: "Riwayat Aktivitas", href: "/dashboard/history" },
  { icon: Monitor, label: "Display TV", href: "/dashboard/display-settings" },
  { icon: Megaphone, label: "Pengumuman Display", href: "/dashboard/pengumuman-display" },
  { icon: Settings, label: "Pengaturan", href: "/dashboard/pengaturan" },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [notifCount, setNotifCount] = useState(0) // ✅ TAMBAHKAN state notifikasi

  // ✅ FETCH NOTIFIKASI COUNT (sama seperti di sidebar)
  useEffect(() => {
    async function fetchNotif() {
      try {
        const res = await fetch('/api/notifikasi/count')
        const data = await res.json()
        setNotifCount(data.count || 0)
      } catch (error) {
        console.error('Error fetch notif:', error)
      }
    }

    fetchNotif()

    // Refresh setiap 30 detik
    const interval = setInterval(fetchNotif, 30000)
    return () => clearInterval(interval)
  }, [])

  async function onLogout() {
    await logoutAction()
  }

  return (
    <>
      {/* HAMBURGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-[#5E2390] text-white shadow-lg hover:bg-[#4a1c70] transition-all md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">

          {/* HEADER */}
          <div className="p-6 bg-linear-to-br from-[#5E2390] to-[#4a1c70] text-white">
            <h2 className="text-xl font-black">RUTAN ENREKANG</h2>
            <p className="text-sm opacity-90 mt-1">Sistem Informasi</p>
          </div>

          {/* MENU ITEMS */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3.5 transition-all relative ${isActive
                      ? 'bg-purple-50 text-[#5E2390] font-bold border-r-4 border-[#5E2390]'
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>

                  {/* ✅ BADGE NOTIFIKASI */}
                  {item.badge && notifCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-5 text-center">
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* LOGOUT */}
          <div className="p-4 border-t border-slate-200">
            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-all"
            >
              <UserCircle className="w-5 h-5" />
              <span>Edit Profil</span>
            </Link>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
            >
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </div>

        </div>
      </div>
    </>
  )
}