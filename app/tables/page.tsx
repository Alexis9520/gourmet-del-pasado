"use client"

import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePOSStore } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { RestaurantTableGrid } from "@/components/RestaurantTableGrid"
import { OrderModal } from "@/components/order-modal"

export default function TablesPage() {
    const router = useRouter()
    const { currentUser, tables } = usePOSStore()
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    // Mobile sidebar handlers
    const handleMobileMenuToggle = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleMobileSidebarClose = () => {
        setIsMobileSidebarOpen(false);
    };

    useEffect(() => {
        if (!currentUser) {
            router.push("/")
        }
    }, [currentUser, router])

    if (!currentUser) return null

    const selectedTable = tables.find((t) => t.id === selectedTableId)

    // Transformar las mesas del store al formato del nuevo componente
    const tableGridData = tables.map(table => {
        // Mapear el estado de ocupación a las 6 sillas
        // Si la mesa está ocupada, todas las sillas están ocupadas
        // Si está libre, todas disponibles
        const isOccupied = table.status === "ocupado" || table.status === "reservado" || table.status === "pago pendiente"
        const seatStatus = isOccupied ? "occupied" : "available"
        
        return {
            id: table.id,
            number: table.number,
            seats: Array(6).fill(seatStatus) as ("available" | "occupied")[],
            onClick: () => setSelectedTableId(table.id)
        }
    })

    return (
        <div className="flex h-screen bg-[#FFF5ED] font-sans">
            <Toaster position="top-center" reverseOrder={false} />
            <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={handleMobileSidebarClose} />
            <div className="flex flex-1 flex-col">
                <Header onMobileMenuToggle={handleMobileMenuToggle} />
                <main className="flex-1 overflow-y-auto">
                    <RestaurantTableGrid tables={tableGridData} />
                </main>
            </div>

            {selectedTable && <OrderModal table={selectedTable} onClose={() => setSelectedTableId(null)} />}
        </div>
    )
}
