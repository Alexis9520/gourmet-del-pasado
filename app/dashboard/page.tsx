"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function DashboardPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#FFF5ED]">
      <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen((s) => !s)} />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#A65F33]">Dashboard</h1>
            <p className="text-[#A65F33]/70 mt-1">Resumen administrativo.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-[#FFE0C2] p-6 shadow-sm">
              <p className="text-sm text-[#A65F33]/70">Ventas Hoy</p>
              <p className="text-2xl font-bold text-[#FFA142] mt-2">S/ 3,410.50</p>
            </div>

            <div className="bg-white rounded-xl border border-[#FFE0C2] p-6 shadow-sm">
              <p className="text-sm text-[#A65F33]/70">Órdenes Pendientes</p>
              <p className="text-2xl font-bold text-[#A65F33] mt-2">12</p>
            </div>

            <div className="bg-white rounded-xl border border-[#FFE0C2] p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-[#A65F33]/70">Cerrar Día</p>
                <p className="text-xs text-[#A65F33]/60">Ejecuta el arqueo y cierre de caja</p>
              </div>
              <Button className="bg-[#FFA142] text-white"><CheckCircle2 className="h-4 w-4" /> Cerrar</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
