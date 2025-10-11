"use client"

import { useState } from "react"
import { X, CreditCard, Banknote, Smartphone, Building2 } from "lucide-react"
import type { Table } from "@/lib/store"
import { usePOSStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PaymentModalProps {
  table: Table
  onClose: () => void
}

type PaymentMethod = "efectivo" | "tarjeta" | "yape" | "transferencia"

export function PaymentModal({ table, onClose }: PaymentModalProps) {
  const { processPayment } = usePOSStore()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState(table.total.toString())

  const paymentMethods = [
    { id: "efectivo" as PaymentMethod, name: "Efectivo", icon: Banknote },
    { id: "tarjeta" as PaymentMethod, name: "Tarjeta (POS)", icon: CreditCard },
    { id: "yape" as PaymentMethod, name: "Yape/Plin", icon: Smartphone },
    { id: "transferencia" as PaymentMethod, name: "Transferencia", icon: Building2 },
  ]

  const handleConfirmPayment = () => {
    if (!selectedMethod) return
    processPayment(table.id, selectedMethod)
    onClose()
  }

  const receivedAmount = Number.parseFloat(amount) || 0
  const change = receivedAmount - table.total

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-xl font-bold text-foreground">Registrar Pago</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Total a Pagar</p>
            <p className="font-display text-4xl font-bold text-primary">S/ {table.total.toFixed(2)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Mesa {table.number}</p>
          </div>

          <div className="mb-6">
            <Label className="mb-3 block text-sm font-semibold">Método de Pago</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                      selectedMethod === method.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-semibold">{method.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedMethod === "efectivo" && (
            <div className="mb-6 space-y-3">
              <div>
                <Label htmlFor="amount">Monto Recibido</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              {change >= 0 && (
                <div className="rounded-lg bg-success/10 p-3 text-center">
                  <p className="text-sm text-muted-foreground">Vuelto</p>
                  <p className="font-display text-2xl font-bold text-success">S/ {change.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleConfirmPayment}
            disabled={!selectedMethod}
            className="h-12 w-full text-base font-semibold"
          >
            Confirmar Pago y Cerrar Mesa
          </Button>
        </div>
      </div>
    </div>
  )
}
