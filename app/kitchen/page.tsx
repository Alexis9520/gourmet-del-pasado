"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePOSStore } from "@/lib/store"
import { KitchenTicketCard } from "@/components/kitchen-ticket-card"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function KitchenPage() {
  const router = useRouter()
  const { currentUser, kitchenTickets, logout } = usePOSStore()

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
    }
  }, [currentUser, router])

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-700 bg-[#0f0f0f] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold">
            CP
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Comanda Pro - Cocina</h1>
            <p className="text-sm text-gray-400">Sistema de Pedidos</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            logout()
            router.push("/")
          }}
          className="border-gray-600 bg-transparent text-white hover:bg-gray-800"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Salir
        </Button>
      </header>

      {/* Main content */}
      <main className="p-6">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold">Pedidos Pendientes</h2>
          <p className="text-sm text-gray-400">{kitchenTickets.length} pedidos en cola</p>
        </div>

        {kitchenTickets.length === 0 ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-6xl">👨‍🍳</div>
              <p className="text-xl text-gray-400">No hay pedidos pendientes</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {kitchenTickets.map((ticket) => (
              <KitchenTicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
