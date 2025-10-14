"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CreditCard, Banknote, Smartphone, Building2, CheckCircle2, Printer, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Table, CompletedOrder } from "@/lib/store"
import { usePOSStore } from "@/lib/store"


const FinalReceipt = ({ order }: { order: CompletedOrder | null }) => {
  if (!order) return null;
  const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
  const igv = order.total * 0.18;
  const subtotal = order.total - igv;

  return (
    <div className="text-black text-xs font-mono p-2">
      <div className="w-[280px] mx-auto">
        <div className="text-center mb-2">
          <h2 className="font-bold text-sm">Quantify Gourmet</h2>
          <p>Av. Principal 123, Lima</p>
          <p>RUC: 20123456789</p>
          <p>----------------------------------------</p>
          <p className="font-bold">BOLETA DE VENTA</p>
          <p>Comprobante N°: {order.id.slice(-8).toUpperCase()}</p>
          <p>----------------------------------------</p>
        </div>
        <div className="mb-2">
          <p>Mesa: {order.tableNumber}</p>
          <p>Mesero: {order.waiter}</p>
          <p>Fecha: {new Date(order.completionTime).toLocaleDateString("es-PE")}</p>
          <p>Hora: {new Date(order.completionTime).toLocaleTimeString("es-PE")}</p>
        </div>
        <table className="w-full">
          <thead><tr><th className="text-left">Cant.</th><th className="text-left">Desc.</th><th className="text-right">Total</th></tr></thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id}><td>{item.quantity}</td><td>{item.name}</td><td className="text-right">{(item.price * item.quantity).toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
        <p>----------------------------------------</p>
        <div className="space-y-1">
          <div className="flex justify-between"><p>Subtotal:</p><p>{currencyFormatter.format(subtotal)}</p></div>
          <div className="flex justify-between"><p>IGV (18%):</p><p>{currencyFormatter.format(igv)}</p></div>
          <div className="flex justify-between font-bold text-sm"><p>TOTAL:</p><p>{currencyFormatter.format(order.total)}</p></div>
        </div>
        <div className="text-center mt-2">
          <p>----------------------------------------</p>
          <p>¡Gracias por su visita!</p>
        </div>
      </div>
    </div>
  );
};

const ElectronicTicketModal = ({ order, isOpen, onClose }: { order: CompletedOrder | null, isOpen: boolean, onClose: () => void }) => {
  if (!order) return null;
  const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
  const igv = order.total * 0.18;
  const subtotal = order.total - igv;
  const qrData = `RUC|20123456789|BOLETA|${order.id.slice(-8)}|${igv.toFixed(2)}|${order.total.toFixed(2)}|${new Date(order.completionTime).toISOString().split('T')[0]}|`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 border-[#FFE0C2] bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Boleta de Venta Electrónica</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className="text-center mb-4">
            <h3 className="font-bold text-lg text-[#A65F33]">Quantify Gourmet S.A.C.</h3>
            <p className="text-sm text-[#A65F33]/80">RUC: 20123456789</p>
            <p className="text-sm text-[#A65F33]/80">Av. Principal 123, Lima, Perú</p>
          </div>
          <div className="border-2 border-[#A65F33] rounded-lg p-3 text-center mb-4">
            <p className="font-bold text-xl text-[#A65F33]">BOLETA DE VENTA ELECTRÓNICA</p>
            <p className="font-bold text-lg text-[#A65F33]">B001 - {order.id.slice(-6)}</p>
          </div>
          <div className="text-sm mb-4 space-y-1 text-[#A65F33]">
            <p><strong>Fecha de Emisión:</strong> {new Date(order.completionTime).toLocaleString("es-PE")}</p>
            <p><strong>Cliente:</strong> CLIENTES VARIOS</p>
          </div>
          <table className="w-full text-sm text-[#A65F33]">
            <thead>
              <tr className="border-b-2 border-dashed border-[#FFE0C2]"><th className="text-left pb-1">Descripción</th><th className="text-right pb-1">Importe</th></tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id}><td className="pt-1">{item.quantity}x {item.name}</td><td className="text-right pt-1">{currencyFormatter.format(item.price * item.quantity)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 pt-4 border-t-2 border-dashed border-[#FFE0C2] space-y-2 text-[#A65F33]">
            <div className="flex justify-between"><p>Op. Gravada:</p><p>{currencyFormatter.format(subtotal)}</p></div>
            <div className="flex justify-between"><p>IGV (18%):</p><p>{currencyFormatter.format(igv)}</p></div>
            <div className="flex justify-between font-bold text-lg"><p>IMPORTE TOTAL:</p><p>{currencyFormatter.format(order.total)}</p></div>
          </div>
          <div className="flex justify-center mt-4">
            <img src={qrUrl} alt="Código QR de la boleta" />
          </div>
          <p className="text-center text-xs text-[#A65F33]/70 mt-2">Representación Impresa de la Boleta de Venta Electrónica.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
};


type PaymentMethod = "efectivo" | "tarjeta" | "yape" | "transferencia";
const paymentMethods = [
  { id: "efectivo" as PaymentMethod, name: "Efectivo", icon: Banknote },
  { id: "tarjeta" as PaymentMethod, name: "Tarjeta (POS)", icon: CreditCard },
  { id: "yape" as PaymentMethod, name: "Yape/Plin", icon: Smartphone },
  { id: "transferencia" as PaymentMethod, name: "Transferencia", icon: Building2 },
];


export function PaymentModal({ table, onClose }: { table: Table, onClose: () => void }) {
  const { processPayment } = usePOSStore()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState(table.total.toString())
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success">("pending")
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [isETicketVisible, setIsETicketVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = () => {
    if (!selectedMethod || isProcessing) return;
    setIsProcessing(true);

    const finalOrder = processPayment(table.id, selectedMethod);

    if (finalOrder) {
      // Aquí es donde la "magia" ocurre. Al actualizar el estado,
      // el <FinalReceipt> que ya está en el DOM se re-renderiza con los datos.
      setCompletedOrder(finalOrder);
      setPaymentStatus("success");
    } else {
      setIsProcessing(false);
      onClose();
    }
  };
  const handlePrint = () => {
    window.print();
  }
  const receivedAmount = Number.parseFloat(amount) || 0
  const change = receivedAmount - table.total

  return (
    <>
      <div className="printable-container visually-hidden">
        <FinalReceipt order={completedOrder} />
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <ElectronicTicketModal order={completedOrder} isOpen={isETicketVisible} onClose={() => setIsETicketVisible(false)} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-md overflow-hidden rounded-xl bg-[#FFF3E5] border border-[#FFE0C2] shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {paymentStatus === "pending" ? (
              <motion.div key="pending">
                <div className="flex items-center justify-between border-b border-[#FFE0C2] p-4">
                  <h2 className="text-xl font-bold text-[#A65F33]">Registrar Pago</h2>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-[#A65F33]/70 hover:bg-[#FFE0C2] hover:text-[#A65F33]">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-6">
                  <div className="mb-6 rounded-lg bg-[#FFF5ED] border border-[#FFE0C2] p-4 text-center">
                    <p className="text-sm text-[#A65F33]/70">Total a Pagar (Mesa {table.number})</p>
                    <p className="text-5xl font-bold text-[#FFA142]">S/ {table.total.toFixed(2)}</p>
                  </div>
                  <div className="mb-6">
                    <Label className="mb-3 block text-sm font-semibold text-[#A65F33]">Método de Pago</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method) => (
                        <motion.button key={method.id} onClick={() => setSelectedMethod(method.id)} className="relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all" animate={selectedMethod === method.id ? { scale: 1.05 } : { scale: 1 }}>
                          {selectedMethod === method.id && <motion.div layoutId="payment-highlight" className="absolute inset-0 rounded-md bg-[#FFA142]/10 border-2 border-[#FFA142]" />}
                          <method.icon className={cn("h-7 w-7 transition-colors", selectedMethod === method.id ? "text-[#FFA142]" : "text-[#A65F33]/70")} />
                          <span className={cn("text-sm font-semibold transition-colors", selectedMethod === method.id ? "text-[#A65F33]" : "text-[#A65F33]/80")}>{method.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <AnimatePresence>
                    {selectedMethod === "efectivo" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 space-y-4">
                        <div>
                          <Label htmlFor="amount" className="font-semibold text-[#A65F33]">Monto Recibido</Label>
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A65F33]/60 font-semibold">S/</span>
                            <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 pl-9 text-lg border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33] focus:border-[#FFA142] focus:ring-[#FFA142]/50" />
                          </div>
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            {['20', '50', '100'].map(val => <Button key={val} type="button" variant="outline" className="border-[#FFE0C2] bg-white text-[#A65F33]" onClick={() => setAmount(val)}>S/ {val}</Button>)}
                            <Button type="button" variant="outline" className="border-[#FFE0C2] bg-white text-[#A65F33]" onClick={() => setAmount(table.total.toString())}>Exacto</Button>
                          </div>
                        </div>
                        {change >= 0 && (
                          <div className="rounded-lg bg-green-100 p-3 text-center">
                            <p className="text-sm text-green-700">Vuelto a entregar</p>
                            <p className="text-2xl font-bold text-green-600">S/ {change.toFixed(2)}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button onClick={handleConfirmPayment} disabled={!selectedMethod || isProcessing} className="h-12 w-full text-base font-semibold bg-[#FFA142] text-white hover:bg-[#FFB167] disabled:bg-orange-300">
                    {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirmar Pago y Cerrar Mesa'}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.2, type: "spring" } }}>
                  <CheckCircle2 className="h-24 w-24 text-green-500" />
                </motion.div>
                <h2 className="mt-4 text-2xl font-bold text-[#A65F33]">¡Pago Registrado!</h2>
                <p className="text-[#A65F33]/70 mb-6 text-center">La mesa ha sido cerrada. ¿Deseas generar un comprobante?</p>
                <div className="w-full space-y-3">
                  <Button onClick={handlePrint} variant="outline" className="w-full h-12 text-base border-[#FFE0C2] bg-white text-[#A65F33] hover:bg-[#F4EFDF]">
                    <Printer className="mr-2 h-5 w-5" /> Imprimir Boleta
                  </Button>
                  <Button onClick={() => setIsETicketVisible(true)} variant="outline" className="w-full h-12 text-base border-[#FFE0C2] bg-white text-[#A65F33] hover:bg-[#F4EFDF]">
                    <FileText className="mr-2 h-5 w-5" /> Boleta Electrónica
                  </Button>
                </div>
                <Button onClick={onClose} className="mt-6 h-12 w-full text-base font-semibold bg-[#FFA142] text-white hover:bg-[#FFB167]">
                  Finalizar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}