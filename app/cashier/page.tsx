"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { usePOSStore } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Clock, User, Printer, CreditCard, ReceiptText, Store, ShoppingBag, Bike } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaymentModal } from "@/components/payment-modal"
import { cn } from "@/lib/utils"
import type { OrderType } from "@/lib/store"
import { CashGuard } from "@/components/cash-register/CashGuard"
import CashHistory from "@/components/cash-register/CashHistory"
import { CloseRegisterModal } from "@/components/cash-register/CloseRegisterModal"

const PrintStyles = () => (
  <style jsx global>{`
    @media screen {
      .visually-hidden {
        position: absolute !important;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
    }
    @media print {
      body * {
        visibility: hidden;
      }
      .printable-container, .printable-container * {
        visibility: visible;
      }
      .printable-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      
      /* ✅ INICIO DE ESTILOS PARA TICKET DE 80mm */
      .ticket {
        width: 280px; /* Ancho estándar para papel térmico de 80mm */
        margin: 0;
        padding: 5px;
        font-family: 'Courier New', Courier, monospace; /* Fuente monoespaciada */
        font-size: 10pt;
        color: #000;
        background-color: #fff; /* Fondo blanco para impresión */
      }

      .ticket .header, .ticket .footer {
        text-align: center;
      }
      
      .ticket p {
        margin: 4px 0;
      }

      .ticket .info {
        margin: 10px 0;
      }

      /* Estilos para la nueva lista de items con Flexbox */
      .ticket .items .item-row {
        display: flex;
        justify-content: space-between;
        margin: 3px 0;
      }
      .ticket .items .header-row {
        font-weight: bold;
        border-bottom: 1px dashed #000;
        padding-bottom: 3px;
        margin-bottom: 3px;
      }

      .ticket .item-qty {
        width: 3ch; /* Ancho para 'Cant' (3 caracteres) */
        text-align: left;
        flex-shrink: 0;
      }
      .ticket .item-name {
        flex-grow: 1; /* El nombre del producto ocupa el espacio restante */
        margin: 0 8px;
        text-align: left;
      }
      .ticket .item-total {
        text-align: right;
        flex-shrink: 0;
      }

      /* Estilos para la fila del TOTAL */
      .ticket .total-row {
        display: flex;
        justify-content: space-between;
        font-size: 12pt;
        font-weight: bold;
        margin-top: 5px;
      }
      /* ✅ FIN DE ESTILOS PARA TICKET */
    }
  `}</style>
);

const PrintableTicket = ({ selectedTableId }: { selectedTableId: string | null }) => {
  const { tables } = usePOSStore();
  const table = tables.find((t) => t.id === selectedTableId);

  if (!table) {
    return null;
  }

  return (
    <div className="printable-container visually-hidden">
      {/* ✅ Este div 'ticket' será nuestro contenedor con ancho fijo */}
      <div className="ticket">
        <div className="header">
          <h2 style={{ fontWeight: 'bold', fontSize: '16pt', margin: 0 }}>Mi Restaurante</h2>
          <p>Av. Principal 123, Lima</p>
          <p>RUC: 20123456789</p>
          <p>--------------------------------</p>
          <p style={{ fontWeight: 'bold', fontSize: '14pt' }}>PRE-CUENTA</p>
          <p>--------------------------------</p>
        </div>

        <div className="info">
          <p><strong>Mesa:</strong> {table.number}</p>
          <p><strong>Mesero:</strong> {table.waiter}</p>
          <p><strong>Tipo:</strong> {table.orderType === "mesa" ? "Consumo en Mesa" : table.orderType === "para-llevar" ? "Para Llevar" : "Delivery"}</p>
          <p><strong>Fecha:</strong> {new Date().toLocaleDateString("es-PE")}</p>
          <p><strong>Hora:</strong> {new Date().toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <p>--------------------------------</p>

        {/* ✅ Estructura de items refactorizada SIN <table> */}
        <div className="items">
          <div className="item-row header-row">
            <span className="item-qty">Cant</span>
            <span className="item-name">Descripción</span>
            <span className="item-total">Total</span>
          </div>
          {table.orders.map((order) => (
            <div key={order.id} className="item-row">
              <span className="item-qty">{order.quantity}</span>
              <span className="item-name">{order.name}</span>
              <span className="item-total">S/{(order.price * order.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <p>--------------------------------</p>

        <div className="total">
          <div className="total-row">
            <span><strong>TOTAL:</strong></span>
            <span><strong>S/ {table.total.toFixed(2)}</strong></span>
          </div>
        </div>

        <div className="footer">
          <p>--------------------------------</p>
          <p>Gracias por su visita</p>
          <p>Este no es un comprobante de pago</p>
        </div>
      </div>
    </div>
  )
}



export default function CashierPage() {
  const router = useRouter()
  const { currentUser, tables, requestPayment } = usePOSStore()
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isCloseRegisterOpen, setIsCloseRegisterOpen] = useState(false)
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

  const accountsToSettle = tables.filter(
    (t) => t.status === "ocupado" || t.status === "pago pendiente"
  );
  const selectedTable = tables.find((t) => t.id === selectedTableId)

  const handlePrintPreTicket = () => {
    if (!selectedTableId) return;

    // Cambia el estado de la mesa a 'pago pendiente'
    requestPayment(selectedTableId);

    // Llama a la función de impresión
    window.print();
  };

  const getElapsedTime = (startTime?: Date) => {
    if (!startTime) return ""
    const now = new Date()
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60)
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false)
    setSelectedTableId(null) // ✅ Esto limpia la selección y la vista de detalles.
  }

  // Helper function to get order type display info
  const getOrderTypeInfo = (orderType?: OrderType) => {
    switch (orderType) {
      case "para-llevar":
        return { icon: ShoppingBag, label: "Para Llevar", color: "text-blue-600 bg-blue-50" };
      case "delivery":
        return { icon: Bike, label: "Delivery", color: "text-purple-600 bg-purple-50" };
      default:
        return { icon: Store, label: "En Mesa", color: "text-green-600 bg-green-50" };
    }
  }

  return (
    <div className="flex h-screen bg-[#FFF5ED]"> {/* Fondo: Crema de Fondo */}
      <PrintStyles />
      <PrintableTicket selectedTableId={!isPaymentModalOpen ? selectedTableId : null} />
      <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={handleMobileSidebarClose} />

      <div className="flex flex-1 flex-col">
        <Header onMobileMenuToggle={handleMobileMenuToggle} />

        <main className="flex flex-1 overflow-hidden">
          <CashGuard>
            {/* ✅ Lado Izquierdo - Lista de cuentas rediseñada */}
            <aside className="w-96 flex-shrink-0 border-r border-[#FFE0C2] bg-[#FFF3E5]"> {/* Fondo: Crema Suave */}
              <div className="border-b border-[#FFE0C2] p-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#A65F33]">Cuentas Abiertas</h2>
                  <p className="text-sm text-[#A65F33]/70">{accountsToSettle.length} mesas ocupadas</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCloseRegisterOpen(true)}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                >
                  Corte de Caja
                </Button>
              </div>

              {/* Caja: estado actual e historial */}
              <div className="p-3 border-b border-[#FFE0C2]">
                <CashHistory />
              </div>

              <div className="h-[calc(100vh-14rem)] overflow-auto p-3">
                {accountsToSettle.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-sm text-[#A65F33]/60">
                    <span>No hay cuentas abiertas</span>
                  </div>
                ) : (
                  <div className="relative space-y-2">
                    {accountsToSettle.map((table) => (
                      <motion.button
                        key={table.id}
                        onClick={() => setSelectedTableId(table.id)}
                        whileHover={{ y: -2 }}
                        className="relative w-full rounded-lg p-4 text-left transition-shadow duration-300 hover:shadow-lg hover:shadow-orange-200/50"
                      >
                        {/* Animación de highlight que se desliza */}
                        {selectedTableId === table.id && (
                          <motion.div
                            layoutId="highlight"
                            className="absolute inset-0 rounded-lg bg-white shadow-md"
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          />
                        )}

                        <div className="relative z-10">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-lg font-bold text-[#A65F33]">Mesa {table.number}</span>
                            <span className={cn("text-xl font-bold", selectedTableId === table.id ? "text-[#FFA142]" : "text-[#A65F33]")}>
                              S/ {table.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[#A65F33]/70">
                            <div className="flex items-center gap-1.5"><User size={14} />{table.waiter}</div>
                            <div className="flex items-center gap-1.5"><Clock size={14} />{getElapsedTime(table.startTime)}</div>
                          </div>
                          {table.status === 'pago pendiente' && (
                            <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-white">
                              PAGO
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* ✅ Lado Derecho - Detalle de cuenta rediseñado */}
            <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                {selectedTable ? (
                  <motion.div
                    key={selectedTable.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mx-auto max-w-xl"
                  >
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-[#A65F33]">Detalle de Cuenta: Mesa {selectedTable.number}</h2>
                      <p className="text-sm text-[#A65F33]/70">Revisa los productos antes de procesar el pago.</p>
                      {selectedTable.orderType && (() => {
                        const typeInfo = getOrderTypeInfo(selectedTable.orderType);
                        const Icon = typeInfo.icon;
                        return (
                          <div className={cn("mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", typeInfo.color)}>
                            <Icon className="h-3.5 w-3.5" />
                            <span>{typeInfo.label}</span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="overflow-hidden rounded-lg border border-[#FFE0C2] bg-white shadow-sm">
                      {/* Detalles del mesero y tiempo */}
                      <div className="flex justify-between border-b border-[#FFE0C2] bg-[#FFF3E5]/50 p-4 text-sm">
                        <div className="flex items-center gap-2"><User size={16} className="text-[#A65F33]/70" /> <span className="font-semibold text-[#A65F33]">{selectedTable.waiter}</span></div>
                        <div className="flex items-center gap-2"><Clock size={16} className="text-[#A65F33]/70" /> <span className="font-semibold text-[#A65F33]">{getElapsedTime(selectedTable.startTime)}</span></div>
                      </div>

                      {/* Lista de productos */}
                      <div className="space-y-3 p-6">
                        {selectedTable.orders.map((order) => (
                          <div key={order.id} className="grid grid-cols-12 gap-2 text-[#A65F33]">
                            <div className="col-span-1 font-semibold">x{order.quantity}</div>
                            <div className="col-span-8">
                              <p className="font-semibold">{order.name}</p>
                              {order.notes && <p className="text-xs text-[#A65F33]/60 italic">Nota: {order.notes}</p>}
                            </div>
                            <div className="col-span-3 text-right font-semibold">S/ {(order.price * order.quantity).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>

                      {/* Total y botones */}
                      <div className="bg-[#FFA142] p-6 text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">Total a Pagar</span>
                          <span className="text-4xl font-bold">S/ {selectedTable.total.toFixed(2)}</span>
                        </div>
                        <div className="mt-6 flex gap-3">
                          {/* ✅ 3. Usa la nueva función en el botón */}
                          <Button
                            variant="outline"
                            className="flex-1 border-white/50 bg-transparent text-white hover:bg-white/10"
                            onClick={handlePrintPreTicket}
                            // Opcional: Deshabilita el botón si ya está en pago pendiente
                            disabled={selectedTable?.status === 'pago pendiente'}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            {selectedTable?.status === 'pago pendiente' ? 'Pre-Cuenta Impresa' : 'Imprimir Pre-Cuenta'}
                          </Button>

                          <Button className="flex-1 bg-white text-[#A65F33] shadow-lg hover:bg-gray-100" onClick={() => setIsPaymentModalOpen(true)}>
                            <CreditCard className="mr-2 h-4 w-4" /> Registrar Pago
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex h-full flex-col items-center justify-center text-center"
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF3E5]">
                      <ReceiptText size={60} className="text-[#FFA142]" />
                    </div>
                    <p className="mt-4 text-lg font-bold text-[#A65F33]">Selecciona una cuenta</p>
                    <p className="max-w-xs text-[#A65F33]/70">Elige una de las cuentas abiertas en la lista de la izquierda para ver su detalle y procesar el pago.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </CashGuard>
        </main>
      </div>

      {selectedTable && isPaymentModalOpen && <PaymentModal table={selectedTable} onClose={handleClosePaymentModal} />}
      <CloseRegisterModal isOpen={isCloseRegisterOpen} onClose={() => setIsCloseRegisterOpen(false)} />
    </div>
  )
}
