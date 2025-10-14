"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CompletedOrder } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReceiptText, User, DollarSign, CreditCard, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

// Reutilizamos el Tag de Método de Pago para consistencia
const PaymentMethodTag = ({ method }: { method: string }) => {
  const methodStyles = { efectivo: { icon: DollarSign, text: "Efectivo", className: "bg-green-100 text-green-700" },
    tarjeta: { icon: CreditCard, text: "Tarjeta", className: "bg-blue-100 text-blue-700" },
    yape: { icon: Smartphone, text: "Yape/Plin", className: "bg-purple-100 text-purple-700" },
    transferencia: { icon: Smartphone, text: "Transf.", className: "bg-sky-100 text-sky-700" },};
  const style = methodStyles[method as keyof typeof methodStyles] || { icon: DollarSign, text: method, className: "bg-gray-100 text-gray-700" };
  const Icon = style.icon;
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", style.className)}>
      <Icon size={14} />
      <span>{style.text}</span>
    </div>
  );
};

interface HistoryDetailModalProps {
  order: CompletedOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryDetailModal({ order, isOpen, onClose }: HistoryDetailModalProps) {
  const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
  const dateTimeFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeStyle: 'short' });

  // Variantes de animación para el modal
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  } as const;

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  } as const;
  
  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="p-0 border-[#FFE0C2] bg-white max-w-md shadow-2xl">
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              <DialogHeader className="bg-[#FFF5ED] p-6 text-center rounded-t-lg">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFA142]/10">
                  <ReceiptText className="h-7 w-7 text-[#FFA142]" />
                </div>
                <DialogTitle className="mt-2 text-xl font-bold text-[#A65F33]">
                  Detalle del Pedido #{order.id.slice(-6).toUpperCase()}
                </DialogTitle>
                <DialogDescription className="text-[#A65F33]/70">
                  Mesa {order.tableNumber} - {dateTimeFormatter.format(new Date(order.completionTime))}
                </DialogDescription>
              </DialogHeader>
              
              <div className="p-6">
                {/* Información del Pedido */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#A65F33]/70">Mesero</p>
                    <p className="font-bold text-[#A65F33] flex items-center gap-2"><User size={14}/> {order.waiter || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-[#A65F33]/70">Método de Pago</p>
                    <PaymentMethodTag method={order.paymentMethod} />
                  </div>
                </div>

                {/* Lista de Items */}
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-3">
                  <h4 className="font-semibold text-[#A65F33]">Resumen de Compra</h4>
                  {order.items.map(item => (
                    <motion.div key={item.id} variants={itemVariants} className="flex items-baseline text-sm text-[#A65F33]">
                      <span className="font-semibold">{item.quantity}x</span>
                      <p className="ml-3 flex-shrink-0">{item.name}</p>
                      <div className="mx-2 flex-1 border-b border-dotted border-[#FFE0C2]"></div>
                      <span className="font-semibold">{currencyFormatter.format(item.price * item.quantity)}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Footer con el Total */}
              <div className="bg-[#FFA142] p-6 text-white flex justify-between items-center rounded-b-lg">
                <span className="text-xl font-bold">Total Pagado</span>
                <span className="text-3xl font-bold">{currencyFormatter.format(order.total)}</span>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}