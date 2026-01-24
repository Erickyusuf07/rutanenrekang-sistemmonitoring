// app/dashboard/layout.tsx
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ToastProvider } from "@/components/ui/toast-container"
import { SessionProvider } from "next-auth/react";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Double Check Security (Server Side)
  return (
    <SessionProvider>
    <ToastProvider> 
    <div className="flex h-screen bg-slate-50 flex-col md:flex-row"> 
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-slate-200 bg-white shadow-sm md:block">
        <Sidebar/>
      </aside>

      <MobileNav /> 

      {/* 3. Konten Utama */}
      <main className="flex-1 overflow-y-auto md:ml-64">
        <div className="p-4 md:p-8"> 
          {children}
        </div>
      </main>
    </div>
    </ToastProvider>
    </SessionProvider>
  )
}