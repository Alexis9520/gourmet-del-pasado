// Crear la carpeta components/history y dentro este archivo
"use client";

import { motion } from "framer-motion";
import type { CompletedOrder } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, CreditCard, Smartphone, History, Building2 } from "lucide-react"; // Añadí Building2 por si acaso
import { cn } from "@/lib/utils";

// Subcomponente para visualizar el método de pago de forma elegante
const PaymentMethodTag = ({ method }: { method: string }) => {
  const methodStyles = {
    efectivo: { icon: DollarSign, text: "Efectivo", className: "bg-green-100 text-green-700" },
    tarjeta: { icon: CreditCard, text: "Tarjeta", className: "bg-blue-100 text-blue-700" },
    yape: { icon: Smartphone, text: "Yape/Plin", className: "bg-purple-100 text-purple-700" },
    transferencia: { icon: Building2, text: "Transf.", className: "bg-sky-100 text-sky-700" },
  };

  const style = methodStyles[method as keyof typeof methodStyles] || { icon: DollarSign, text: method, className: "bg-gray-100 text-gray-700" };
  const Icon = style.icon;

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", style.className)}>
      <Icon size={14} />
      <span>{style.text}</span>
    </div>
  );
};

interface HistoryTableProps {
  orders: CompletedOrder[];
  onRowClick: (order: CompletedOrder) => void;
}

export function HistoryTable({ orders, onRowClick }: HistoryTableProps) {
  const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
  const dateTimeFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' });

  // Variantes de animación para la tabla
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="rounded-xl border border-[#FFE0C2] bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-[#FFF3E5]">
          <TableRow>
            <TableHead className="text-[#A65F33] font-semibold">Fecha y Hora</TableHead>
            <TableHead className="text-center text-[#A65F33] font-semibold">Mesa</TableHead>
            <TableHead className="text-[#A65F33] font-semibold">Mesero</TableHead>
            <TableHead className="text-[#A65F33] font-semibold">Método de Pago</TableHead>
            <TableHead className="text-right text-[#A65F33] font-semibold">Total</TableHead>
          </TableRow>
        </TableHeader>
        
        {/* ✅ CAMBIO 1: Usar motion.tbody directamente en lugar de <TableBody as={...}> */}
        <motion.tbody
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <History size={48} className="text-[#A65F33]/30" />
                  <p className="text-lg font-semibold text-[#A65F33]">Sin Transacciones</p>
                  <p className="max-w-xs text-sm text-[#A65F33]/70">
                    Cuando se complete el primer pago, aparecerá aquí en el historial.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => (
              // ✅ CAMBIO 2: Usar motion.tr directamente en lugar de <TableRow as={...}>
              <motion.tr
                key={order.id}
                variants={rowVariants}
                onClick={() => onRowClick(order)}
                whileHover={{ y: -2, backgroundColor: "#F4EFDF" }}
                whileTap={{ scale: 0.99 }}
                // ✅ CAMBIO 3: Aplicamos manualmente las clases base de TableRow
                className={cn(
                  "cursor-pointer text-[#A65F33] border-b transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-[#FFF5ED]/60"
                )}
              >
                {/* Los TableCell no necesitan cambios */}
                <TableCell>{dateTimeFormatter.format(new Date(order.completionTime))}</TableCell>
                <TableCell className="text-center font-bold">{order.tableNumber}</TableCell>
                <TableCell>{order.waiter || "N/A"}</TableCell>
                <TableCell>
                  <PaymentMethodTag method={order.paymentMethod} />
                </TableCell>
                <TableCell className="text-right font-bold text-lg text-[#FFA142]">
                  {currencyFormatter.format(order.total)}
                </TableCell>
              </motion.tr>
            ))
          )}
        </motion.tbody>
      </Table>
    </div>
  );
}