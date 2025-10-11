"use client"

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

  return (
    <div className="flex h-screen bg-[#FAF8F4] font-modern">
      <style>{`
        .font-modern {
          font-family: 'Montserrat', 'Poppins', 'Segoe UI', 'sans-serif';
        }
        .page-title {
          color: #A65F33;
          font-weight: 700;
        }
        .page-desc {
          color: #F68C1F;
          font-size: 1rem;
          opacity: 0.85;
        }
        .tables-grid {
          gap: 2rem;
          padding-bottom: 2rem;
          margin-top: 0.5rem;
        }
        @media (max-width: 1200px) {
          .tables-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 1.2rem;
          }
        }
        @media (max-width: 900px) {
          .tables-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1rem;
          }
        }
        @media (max-width: 600px) {
          .tables-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem;
          }
        }
        /* Mesa legend */
        .mesa-legend {
          display: flex;
          gap: 1.7rem;
          margin-bottom: 2.5rem;
        }
        .mesa-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.98rem;
          font-weight: 600;
          color: #A65F33;
          background: #FFF;
          border-radius: 16px;
          padding: 6px 14px;
          box-shadow: 0 1px 6px #FFA14215;
        }
        .legend-dot {
          display: inline-block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          margin-right: 2px;
        }
        .dot-free { background: #F68C1F; }
        .dot-occupied { background: #FF7043; }
        .dot-reserved { background: #7DBB3C; }
      `}</style>
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h2 className="font-modern text-2xl page-title">Mapa de Mesas</h2>
            <p className="page-desc">Seleccione una mesa para tomar pedido</p>
          </div>

          {/* Leyenda de estado de mesa */}
          <div className="mesa-legend">
            <span className="mesa-legend-item">
              <span className="legend-dot dot-free"></span>
              Libre
            </span>
            <span className="mesa-legend-item">
              <span className="legend-dot dot-occupied"></span>
              Ocupada
            </span>
            <span className="mesa-legend-item">
              <span className="legend-dot dot-reserved"></span>
              Reservada
            </span>
          </div>

          <div className="grid tables-grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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