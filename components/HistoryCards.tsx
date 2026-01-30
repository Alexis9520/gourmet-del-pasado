"use client";

import { motion } from "framer-motion";
import type { CompletedOrder } from "@/lib/store";
import { DollarSign, CreditCard, Smartphone, Building2, Calendar, User, ShoppingBag } from "lucide-react";
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

interface HistoryCardsProps {
    orders: CompletedOrder[];
    onCardClick: (order: CompletedOrder) => void;
}

export function HistoryCards({ orders, onCardClick }: HistoryCardsProps) {
    const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
    const dateTimeFormatter = new Intl.DateTimeFormat('es-PE', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true
    });

    // Variantes de animación para el contenedor
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-center py-20 rounded-xl bg-white border border-[#FFE0C2]">
                <ShoppingBag size={48} className="text-[#A65F33]/30" />
                <p className="text-lg font-semibold text-[#A65F33]">Sin Transacciones</p>
                <p className="max-w-xs text-sm text-[#A65F33]/70">
                    Cuando se complete el primer pago, aparecerá aquí en el historial.
                </p>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
            {orders.map((order) => {
                const isCash = order.paymentMethod === 'efectivo';
                const hasDetails = isCash && order.amountPaid !== undefined;

                return (
                    <motion.div
                        key={order.id}
                        variants={cardVariants}
                        onClick={() => onCardClick(order)}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative bg-white overflow-hidden cursor-pointer"
                        style={{
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), 95% 100%, 90% calc(100% - 10px), 85% 100%, 80% calc(100% - 10px), 75% 100%, 70% calc(100% - 10px), 65% 100%, 60% calc(100% - 10px), 55% 100%, 50% calc(100% - 10px), 45% 100%, 40% calc(100% - 10px), 35% 100%, 30% calc(100% - 10px), 25% 100%, 20% calc(100% - 10px), 15% 100%, 10% calc(100% - 10px), 5% 100%, 0 calc(100% - 10px))"
                            // Zig-zag bottom simulation with clip-path
                        }}
                    >
                        {/* Status Stripe Top */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF7043] to-[#FFA142]" />

                        <div className="p-5 flex flex-col gap-4">
                            {/* Header: Table & Time */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#A65F33]/50">Mesa</span>
                                    <div className="text-3xl font-black text-[#A65F33] leading-none mt-0.5">{order.tableNumber}</div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A65F33]/60 bg-orange-50 px-2 py-1 rounded-md">
                                        <Calendar size={12} />
                                        {dateTimeFormatter.format(new Date(order.completionTime))}
                                    </div>
                                </div>
                            </div>

                            {/* Divider Dashed */}
                            <div className="w-full h-px border-t-2 border-dashed border-[#FFE0C2]/60" />

                            {/* Financials */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-sm font-semibold text-[#A65F33]/80">Total</span>
                                    <span className="text-2xl font-bold text-[#FFA142]">
                                        {currencyFormatter.format(order.total)}
                                    </span>
                                </div>

                                {hasDetails && (
                                    <>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Recibido</span>
                                            <span className="font-mono text-gray-700">
                                                {currencyFormatter.format(order.amountPaid!)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Vuelto</span>
                                            <span className={cn(
                                                "font-mono font-bold px-1.5 rounded",
                                                (order.change || 0) > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                            )}>
                                                {(order.change || 0) > 0 ? currencyFormatter.format(order.change!) : "No hay vuelto"}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer Info */}
                            <div className="mt-auto pt-3 border-t border-[#FFE0C2]/30 flex items-center justify-between">
                                <PaymentMethodTag method={order.paymentMethod} />
                                <div className="flex items-center gap-1.5 text-xs text-[#A65F33]/50">
                                    <User size={12} />
                                    <span className="truncate max-w-[80px]">{order.waiter || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
