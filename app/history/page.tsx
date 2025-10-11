"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePOSStore } from "@/lib/store";
import type { CompletedOrder } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { HistoryTable } from "@/components/HistoryTable";
import { HistoryDetailModal } from "@/components/HistoryDetailModal";

export default function HistoryPage() {
  const router = useRouter();
  const currentUser = usePOSStore((state) => state.currentUser);
  const orderHistory = usePOSStore((state) => state.orderHistory);
  
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#FAF8F4] font-modern">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto flex flex-col p-8">
          {/* Cabecera de la página */}
          <div className="mb-6 w-full max-w-6xl mx-auto">
            <h2 className="font-modern text-2xl page-title">Historial de Ventas</h2>
            <p className="page-desc">
              Aquí puedes ver todas las transacciones completadas. Haz clic en una fila para ver los detalles.
            </p>
          </div>
          
          {/* Contenedor de la tabla */}
          <div className="flex-grow w-full max-w-6xl mx-auto bg-card rounded-lg border shadow-flat overflow-hidden">
             <HistoryTable 
               orders={orderHistory} 
               onRowClick={setSelectedOrder} 
             />
          </div>
        </main>
      </div>

      {/* El modal para ver detalles, se muestra fuera del flujo principal */}
      {selectedOrder && (
        <HistoryDetailModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      
      {/* Estilos compartidos para los títulos de la página */}
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
      `}</style>
    </div>
  );
}