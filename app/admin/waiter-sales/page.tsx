"use client"

import { useState, useMemo } from "react"
import { usePOSStore } from "@/lib/store"
import { motion } from "framer-motion"
import { Search, Calculator, TrendingUp, Users, Award, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// Layout Components
import { Sidebar } from "@/components/sidebar"

export default function WaiterSalesPage() {
    const { orderHistory } = usePOSStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("all")

    // 1. Filter Data by Date
    const filteredHistory = useMemo(() => {
        const now = new Date()
        return orderHistory.filter(order => {
            // Basic Search Filter
            const searchMatch =
                (order.waiter?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                order.tableNumber.toString().includes(searchTerm)

            if (!searchMatch) return false

            // Date Range Filter
            const orderDate = new Date(order.completionTime)
            if (dateRange === "today") {
                return orderDate.toDateString() === now.toDateString()
            }
            if (dateRange === "week") {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                return orderDate >= oneWeekAgo
            }
            if (dateRange === "month") {
                const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                return orderDate >= oneMonthAgo
            }
            return true
        })
    }, [orderHistory, searchTerm, dateRange])

    // 2. Aggregate Data by Waiter
    const waiterStats = useMemo(() => {
        const stats = new Map<string, {
            name: string
            ordersCount: number
            totalSales: number
            lastSale: Date
            itemsSold: number
        }>()

        filteredHistory.forEach(order => {
            const waiterName = order.waiter || "Sin Asignar"

            const current = stats.get(waiterName) || {
                name: waiterName,
                ordersCount: 0,
                totalSales: 0,
                lastSale: new Date(0), // Epoch
                itemsSold: 0
            }

            current.ordersCount += 1
            current.totalSales += order.total
            current.itemsSold += order.items.reduce((acc, item) => acc + item.quantity, 0)

            const orderDate = new Date(order.completionTime)
            if (orderDate > current.lastSale) {
                current.lastSale = orderDate
            }

            stats.set(waiterName, current)
        })

        return Array.from(stats.values()).sort((a, b) => b.totalSales - a.totalSales)
    }, [filteredHistory])

    // 3. Global Stats
    const totalRevenue = waiterStats.reduce((acc, curr) => acc + curr.totalSales, 0)
    const totalOrders = waiterStats.reduce((acc, curr) => acc + curr.ordersCount, 0)
    const topWaiter = waiterStats.length > 0 ? waiterStats[0] : null

    return (
        <div className="flex h-screen bg-[#FFF5ED] overflow-hidden">
            <Sidebar className="z-20 shadow-xl" />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-[#FFE0C2] bg-white px-8 py-5 shadow-sm z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-[#A65F33]">Kardex de Ventas por Mozo</h1>
                        <p className="text-sm text-[#A65F33]/60">Resumen de desempeño y ventas del personal</p>
                    </div>
                    <div className="flex gap-2 bg-[#FFF3E5] p-1 rounded-lg border border-[#FFE0C2]">
                        {(["today", "week", "month", "all"] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold rounded-md transition-all capitalize",
                                    dateRange === range
                                        ? "bg-[#FFA142] text-white shadow-sm"
                                        : "text-[#A65F33]/70 hover:bg-[#FFE0C2]/50"
                                )}
                            >
                                {range === "today" ? "Hoy" : range === "week" ? "7 Días" : range === "month" ? "Mes" : "Histórico"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="mx-auto max-w-7xl space-y-8">

                        {/* Summary Cards */}
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg shadow-orange-500/20">
                                <div className="relative z-10">
                                    <p className="text-orange-100 text-sm font-medium mb-1">Ventas Totales</p>
                                    <h3 className="text-4xl font-bold">S/ {totalRevenue.toFixed(2)}</h3>
                                    <div className="mt-4 flex items-center gap-2 text-orange-100/80 text-xs">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>En el periodo seleccionado</span>
                                    </div>
                                </div>
                                <div className="absolute -right-4 -bottom-4 bg-white/10 p-8 rounded-full blur-2xl block w-32 h-32"></div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#FFE0C2]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[#A65F33]/60 text-sm font-medium mb-1">Pedidos Totales</p>
                                        <h3 className="text-3xl font-bold text-[#A65F33]">{totalOrders}</h3>
                                    </div>
                                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                                        <Calculator className="h-6 w-6" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#FFE0C2]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[#A65F33]/60 text-sm font-medium mb-1">Mejor Desempeño</p>
                                        <h3 className="text-2xl font-bold text-[#A65F33] truncate max-w-[150px]">{topWaiter?.name || "-"}</h3>
                                        <p className="text-sm font-bold text-green-600 mt-1">S/ {topWaiter?.totalSales.toFixed(2) || "0.00"}</p>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-xl text-yellow-600">
                                        <Award className="h-6 w-6" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Filter & Table */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A65F33]/50" />
                                    <Input
                                        placeholder="Buscar por nombre de mozo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white border-[#FFE0C2] text-[#A65F33] placeholder:text-[#A65F33]/40"
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#FFE0C2] bg-white shadow-sm overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#FFF3E5] text-[#A65F33]">
                                        <tr>
                                            <th className="px-6 py-4 font-bold border-b border-[#FFE0C2]">Mozo</th>
                                            <th className="px-6 py-4 font-bold border-b border-[#FFE0C2] text-center">Cant. Pedidos</th>
                                            <th className="px-6 py-4 font-bold border-b border-[#FFE0C2] text-center">Items Vendidos</th>
                                            <th className="px-6 py-4 font-bold border-b border-[#FFE0C2]">Última Venta</th>
                                            <th className="px-6 py-4 font-bold border-b border-[#FFE0C2] text-right">Total Vendido</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#FFE0C2]/50">
                                        {waiterStats.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-[#A65F33]/50">
                                                    No hay registros de ventas para el periodo seleccionado.
                                                </td>
                                            </tr>
                                        ) : (
                                            waiterStats.map((stat) => (
                                                <tr key={stat.name} className="hover:bg-[#FFF9F5] transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-[#A65F33]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
                                                                {stat.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            {stat.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-block min-w-[30px] py-1 px-2 bg-gray-100 rounded-lg text-gray-700 font-bold text-xs">{stat.ordersCount}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-[#A65F33]/80">{stat.itemsSold}</td>
                                                    <td className="px-6 py-4 text-[#A65F33]/80">{stat.lastSale.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-[#A65F33]">S/ {stat.totalSales.toFixed(2)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
