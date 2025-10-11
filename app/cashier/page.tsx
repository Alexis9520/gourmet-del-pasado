"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePOSStore } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaymentModal } from "@/components/payment-modal"

const PrintStyles = () => (
  <style jsx global>{`
    @media screen {
      .visually-hidden {
        position: absolute;
        left: -9999px;
        top: -9999px;
      }
    }
    @media print {
      /* Hide everything on the page by default */
      body * {
        visibility: hidden;
      }

      /* Make the printable ticket container and its children visible */
      .printable-ticket-container, .printable-ticket-container * {
        visibility: visible;
      }

      /* Position the ticket at the top of the print page */
      .printable-ticket-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        font-family: 'Courier New', Courier, monospace;
        font-size: 10pt;
        color: #000;
      }

      .ticket {
        width: 280px; /* Standard thermal receipt paper width (80mm) */
        margin: 0 auto;
        padding: 5px;
      }

      .ticket .header, .ticket .footer {
        text-align: center;
      }

      .ticket h2 {
        margin: 0;
        font-size: 14pt;
        font-weight: bold;
      }

      .ticket p {
        margin: 4px 0;
      }

      .ticket .info, .ticket .total {
        margin: 10px 0;
      }
      
      .ticket .items table {
        width: 100%;
        border-collapse: collapse;
      }

      .ticket .items th, .ticket .items td {
        padding: 3px 0;
      }

      /* Align table columns */
      .ticket .items th:nth-child(1), .ticket .items td:nth-child(1) { text-align: left; width: 15%; } /* Cant. */
      .ticket .items th:nth-child(2), .ticket .items td:nth-child(2) { text-align: left; } /* Descripcion */
      .ticket .items th:nth-child(3), .ticket .items td:nth-child(3) { text-align: right; width: 30%; } /* Total */

      .ticket .total .total-row {
        display: flex;
        justify-content: space-between;
        font-size: 12pt;
        font-weight: bold;
        margin-top: 5px;
      }
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
    <div className="printable-ticket-container visually-hidden">
      <div className="ticket">
        <div className="header">
          <h2 className="font-bold text-lg">Mi Restaurante</h2>
          <p>Av. Principal 123, Lima</p>
          <p>RUC: 20123456789</p>
          <p>--------------------------------</p>
          <p className="font-bold text-xl">PRE-CUENTA</p>
          <p>--------------------------------</p>
        </div>
        <div className="info">
          <p><strong>Mesa:</strong> {table.number}</p>
          <p><strong>Mesero:</strong> {table.waiter}</p>
          <p><strong>Fecha:</strong> {new Date().toLocaleDateString("es-PE")}</p>
          <p><strong>Hora:</strong> {new Date().toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="items">
          <table>
            <thead>
              <tr>
                <th>Cant.</th>
                <th>Descripción</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {table.orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.quantity}</td>
                  <td>{order.name}</td>
                  <td>S/ {(order.price * order.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="total">
          <p>--------------------------------</p>
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
  const { currentUser, tables } = usePOSStore()
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
    }
  }, [currentUser, router])

  if (!currentUser) return null

  const occupiedTables = tables.filter((t) => t.status === "ocupado")
  const selectedTable = tables.find((t) => t.id === selectedTableId)

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
    setSelectedTableId(null)
  }

  return (
    <div className="flex h-screen bg-background">
      <PrintStyles />
      <PrintableTicket selectedTableId={selectedTableId} />
      <Sidebar className="no-print"/>

      <div className="flex flex-1 flex-col">
        <Header className="no-print"/>

        <main className="flex flex-1 overflow-hidden">
          {/* Left side - Open accounts list */}
          <div className="no-print w-96 border-r border-border bg-card">
            <div className="border-b border-border p-4">
              <h2 className="font-display text-xl font-bold text-foreground">Cuentas Abiertas</h2>
              <p className="text-sm text-muted-foreground">{occupiedTables.length} mesas ocupadas</p>
            </div>

            <div className="overflow-auto p-4">
              {occupiedTables.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-center text-sm text-muted-foreground">
                  No hay cuentas abiertas
                </div>
              ) : (
                <div className="space-y-3">
                  {occupiedTables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      className={`w-full rounded-lg border p-4 text-left transition-colors ${
                        selectedTableId === table.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:bg-accent"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-display text-lg font-bold text-foreground">Mesa {table.number}</span>
                        <span className="font-display text-xl font-bold text-primary">S/ {table.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{table.waiter}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{getElapsedTime(table.startTime)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Account details */}
          <div className="flex-1 overflow-auto p-6">
            {selectedTable ? (
              <div id="printable-area" className="mx-auto max-w-2xl">
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">Detalle de Cuenta</h2>
                  <p className="text-sm text-muted-foreground">Mesa {selectedTable.number}</p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Mesero</p>
                      <p className="font-semibold text-foreground">{selectedTable.waiter}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tiempo</p>
                      <p className="font-semibold text-foreground">{getElapsedTime(selectedTable.startTime)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedTable.orders.map((order) => (
                      <div key={order.id} className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            <span className="text-primary">x{order.quantity}</span> {order.name}
                          </p>
                          {order.notes && <p className="text-xs text-muted-foreground">Nota: {order.notes}</p>}
                        </div>
                        <p className="font-semibold text-foreground">S/ {(order.price * order.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl font-bold text-foreground">Total</span>
                      <span className="font-display text-3xl font-bold text-primary">
                        S/ {selectedTable.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 no-print">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => window.print()}>
                      Imprimir Pre-Cuenta
                    </Button>
                    <Button className="flex-1" onClick={() => setIsPaymentModalOpen(true)}>
                      Registrar Pago
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-print flex h-full items-center justify-center text-center">
                <div>
                  <div className="mb-4 text-6xl">💳</div>
                  <p className="text-lg text-muted-foreground">Seleccione una cuenta para ver los detalles</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedTable && isPaymentModalOpen && <PaymentModal table={selectedTable} onClose={handleClosePaymentModal} />}
    </div>
  )
}
