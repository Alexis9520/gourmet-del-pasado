"use client"

import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePOSStore } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { TableCard } from "@/components/table-card"
import { OrderModal } from "@/components/order-modal"

export default function TablesPage() {
    const router = useRouter()
    const { currentUser, tables } = usePOSStore()
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null)

    useEffect(() => {
        if (!currentUser) {
            router.push("/")
        }
    }, [currentUser, router])

    if (!currentUser) return null

    const selectedTable = tables.find((t) => t.id === selectedTableId)

    // ✨ Array de configuración para generar la leyenda dinámicamente
    const legendItems = [
        { label: "Libre", color: "bg-[#7DBB3C]" },
        { label: "Atendida", color: "bg-[#FFF3E5] border-2 border-[#FFE0C2]" },
        { label: "Atención Requerida", color: "bg-[#FFA142]" },
        { label: "Listo para Servir", color: "bg-blue-500" },
        { label: "Reservada", color: "bg-[#FF7043]" },
        { label: "Pago Pendiente", color: "bg-yellow-500" },
    ];

    return (
        <div className="flex h-screen bg-[#FFF5ED] font-sans">
            <Toaster position="top-center" reverseOrder={false} />
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#A65F33]">Mapa de Mesas</h2>
                        <p className="text-[#A65F33]/80">Selecciona una mesa para gestionar su pedido.</p>
                    </div>

                    {/* ✨ Leyenda de estados generada dinámicamente */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-8 text-sm font-semibold text-[#A65F33]">
                        {legendItems.map(item => (
                            <div key={item.label} className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full ${item.color}`}></span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-8">
                        {tables.map((table) => (
                            <TableCard key={table.id} table={table} onClick={() => setSelectedTableId(table.id)} />
                        ))}
                    </div>
                </main>
            </div>

            {selectedTable && <OrderModal table={selectedTable} onClose={() => setSelectedTableId(null)} />}
        </div>
    )
}
