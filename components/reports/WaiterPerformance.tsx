"use client";

import { usePOSStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Award, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export function WaiterPerformance() {
    const { orderHistory } = usePOSStore();

    // Group by waiter
    const waiterStats = orderHistory.reduce((acc, order) => {
        const waiterName = order.waiter || "Sin nombre";
        if (!acc[waiterName]) {
            acc[waiterName] = {
                name: waiterName,
                ordersCount: 0,
                totalSales: 0,
            };
        }
        acc[waiterName].ordersCount += 1;
        acc[waiterName].totalSales += order.total;
        return acc;
    }, {} as Record<string, { name: string; ordersCount: number; totalSales: number }>);

    // Convert to array and sort by total sales
    const sortedWaiters = Object.values(waiterStats).sort((a, b) => b.totalSales - a.totalSales);

    // Calculate max for bar width
    const maxSales = sortedWaiters.length > 0 ? sortedWaiters[0].totalSales : 1;

    return (
        <Card className="border-[#FFE0C2] bg-white shadow-sm h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl text-[#A65F33]">
                    <Users size={22} className="text-orange-500" /> Rendimiento de Mozos
                </CardTitle>
                <CardDescription className="text-[#A65F33]/70">
                    Historial de ventas y pedidos por personal.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pr-2 space-y-4">
                {sortedWaiters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-[#A65F33]/50">
                        <Users size={40} className="mb-2 opacity-20" />
                        <p className="text-sm">Aún no hay registros de ventas.</p>
                    </div>
                ) : (
                    sortedWaiters.map((waiter, index) => (
                        <motion.div
                            key={waiter.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#FFF5ED] rounded-xl p-3 border border-[#FFE0C2] flex items-center gap-4 hover:shadow-md transition-shadow"
                        >
                            <div className="relative">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarFallback className="bg-orange-200 text-orange-700 font-bold">
                                        {waiter.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {index < 3 && (
                                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-400" : "bg-orange-600"
                                        }`}>
                                        {index + 1}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-[#A65F33] truncate">{waiter.name}</h4>
                                    <span className="font-bold text-orange-600">S/ {waiter.totalSales.toFixed(2)}</span>
                                </div>

                                <div className="w-full bg-white h-1.5 rounded-full mb-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(waiter.totalSales / maxSales) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-orange-300 to-orange-500"
                                    />
                                </div>

                                <div className="flex items-center gap-3 text-xs text-[#A65F33]/70">
                                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-orange-100/50">
                                        <Award size={12} className="text-orange-400" /> {waiter.ordersCount} Pedidos
                                    </span>
                                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-orange-100/50">
                                        <DollarSign size={12} className="text-green-500" /> Ticket Prom: S/ {(waiter.totalSales / waiter.ordersCount).toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
