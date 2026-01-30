"use client"

import { useState } from "react"
import { Table } from "@/lib/store"
import { usePOSStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreditCard, DollarSign, Smartphone, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { printTicket } from "@/components/print-ticket"

interface PaymentDialogProps {
    table: Table
    isOpen: boolean
    onClose: () => void
}

export function PaymentDialog({ table, isOpen, onClose }: PaymentDialogProps) {
    const { processPayment, addNotification } = usePOSStore()
    const [selectedMethod, setSelectedMethod] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [amountPaid, setAmountPaid] = useState<string>("")

    const paymentMethods = [
        { id: "efectivo", label: "Efectivo", icon: DollarSign, color: "bg-green-500" },
        { id: "tarjeta", label: "Tarjeta", icon: CreditCard, color: "bg-blue-500" },
        { id: "yape", label: "Yape/Plin", icon: Smartphone, color: "bg-purple-500" },
    ]

    const handleAmountChange = (value: string) => {
        // Permitir solo números y un punto decimal
        if (/^\d*\.?\d*$/.test(value)) {
            setAmountPaid(value)
        }
    }

    const handleBillClick = (amount: number) => {
        const currentAmount = parseFloat(amountPaid) || 0
        setAmountPaid((currentAmount + amount).toString())
    }

    const change = (parseFloat(amountPaid) || 0) - table.total
    const isAmountValid = selectedMethod === "efectivo" ? (parseFloat(amountPaid) || 0) >= table.total : true
    const canPay = selectedMethod && isAmountValid

    const handlePayment = () => {
        if (!canPay) return

        setIsProcessing(true)

        const finalAmountPaid = selectedMethod === "efectivo" ? parseFloat(amountPaid) : table.total;
        const finalChange = selectedMethod === "efectivo" ? change : 0;

        // Imprimir ticket final antes de procesar el pago
        // Pasamos los detalles de pago a printTicket si es necesario (hay que actualizar printTicket después)
        printTicket(table, table.orders.map(order => ({
            menuItemId: order.menuItemId,
            name: order.name,
            quantity: order.quantity,
            price: order.price,
            notes: order.notes,
            orderType: order.orderType
        })), 0, finalAmountPaid, finalChange) // Pasamos monto y vuelto

        setTimeout(() => {
            const completedOrder = processPayment(table.id, selectedMethod, finalAmountPaid)

            if (completedOrder) {
                addNotification({
                    type: "success",
                    message: `Pago procesado exitosamente. Mesa ${table.number} liberada.`,
                })
                onClose()
                setAmountPaid("")
                setSelectedMethod("")
            } else {
                addNotification({
                    type: "warning",
                    message: `Error al procesar el pago.`,
                })
            }

            setIsProcessing(false)
        }, 1000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#A65F33]">
                        Cerrar Cuenta - Mesa {table.number}
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona el método de pago para finalizar la orden
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Total */}
                    <div className="rounded-lg border-2 border-[#FFA142] bg-[#FFF5ED] p-4">
                        <div className="flex items-baseline justify-between">
                            <span className="text-lg font-semibold text-[#A65F33]">Total a Pagar:</span>
                            <span className="text-3xl font-bold text-[#FFA142]">S/ {table.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Método de Pago:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {paymentMethods.map((method) => {
                                const Icon = method.icon
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all",
                                            selectedMethod === method.id
                                                ? `${method.color} border-transparent text-white shadow-lg scale-105`
                                                : "border-[#FFE0C2] bg-white text-[#A65F33] hover:bg-[#FFF5ED]"
                                        )}
                                    >
                                        <Icon size={24} />
                                        <span className="font-semibold">{method.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Cash Payment Details */}
                    {selectedMethod === "efectivo" && (
                        <div className="space-y-4 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Monto Recibido</label>
                                <div className="flex gap-2">
                                    <span className="flex items-center justify-center w-10 bg-gray-100 rounded-lg text-gray-500 font-bold">S/</span>
                                    <Input
                                        type="text"
                                        placeholder="0.00"
                                        value={amountPaid}
                                        onChange={(e) => handleAmountChange(e.target.value)}
                                        className="text-lg font-bold text-right"
                                    />
                                </div>
                            </div>

                            {/* Billetes Rápidos */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                {[10, 20, 50, 100, 200].map((bill) => (
                                    <button
                                        key={bill}
                                        onClick={() => handleBillClick(bill)}
                                        className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-sm font-bold hover:bg-green-200 transition-colors"
                                    >
                                        +S/{bill}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setAmountPaid("")}
                                    className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-sm font-bold hover:bg-red-200 transition-colors"
                                >
                                    Limpiar
                                </button>
                            </div>

                            {/* Vuelto */}
                            <div className={cn(
                                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                change >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                            )}>
                                <span className={cn("font-semibold", change >= 0 ? "text-green-700" : "text-red-700")}>Vuelto:</span>
                                <span className={cn("text-xl font-bold", change >= 0 ? "text-green-700" : "text-red-700")}>
                                    S/ {change.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 border-[#FFE0C2]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handlePayment}
                        disabled={!canPay || isProcessing}
                        className={cn(
                            "flex-1 bg-[#FFA142] text-white hover:bg-[#FFB167]",
                            (!canPay || isProcessing) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-2 justify-center">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Procesando...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 justify-center">
                                <CheckCircle2 size={18} />
                                Confirmar Pago
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
