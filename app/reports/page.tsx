"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { usePOSStore } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { TrendingUp, DollarSign, CreditCard, Smartphone, Building2, Award, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { WaiterPerformance } from "@/components/reports/WaiterPerformance"

const SummaryCard = ({ icon: Icon, title, value, iconBgColor }: { icon: React.ElementType, title: string, value: string, iconBgColor: string }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    className="bg-white border border-[#FFE0C2] rounded-xl shadow-sm hover:shadow-lg hover:shadow-orange-200/50 transition-shadow duration-300 h-40" // Altura fija para consistencia
  >
    {/* ✅ CONTENEDOR PRINCIPAL CON MÁS ESPACIO INTERNO (PADDING) */}
    <div className="p-6 flex flex-col justify-between h-full">
      {/* Sección Superior: Título e Ícono */}
      <div className="flex items-start justify-between">
        <p className="text-base font-semibold text-[#A65F33]/80">{title}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-white", iconBgColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Sección Inferior: Valor Principal */}
      <div>
        <p className="text-4xl font-bold text-[#A65F33]">{value}</p>
      </div>
    </div>
  </motion.div>
);


export default function ReportsPage() {
  const router = useRouter()
  const { currentUser } = usePOSStore()

  // Mock data for demonstration
  const [systemTotals] = useState({
    efectivo: 1250.5,
    tarjeta: 890.0,
    yape: 450.0,
    transferencia: 320.0,
  })

  const [countedAmounts, setCountedAmounts] = useState({
    efectivo: "",
    tarjeta: "",
    yape: "",
    transferencia: "",
  })

  const [topDishes] = useState([
    { name: "Lomo Saltado", quantity: 24, revenue: 1080.0 },
    { name: "Ceviche Clásico", quantity: 18, revenue: 630.0 },
    { name: "Ají de Gallina", quantity: 15, revenue: 570.0 },
    { name: "Arroz con Mariscos", quantity: 12, revenue: 576.0 },
    { name: "Pisco Sour", quantity: 28, revenue: 616.0 },
  ])

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
    }
  }, [currentUser, router])

  if (!currentUser || currentUser.role !== "admin") return null

  const totalSales = Object.values(systemTotals).reduce((sum, val) => sum + val, 0)

  const getDifference = (method: keyof typeof systemTotals) => {
    const counted = Number.parseFloat(countedAmounts[method]) || 0
    const system = systemTotals[method]
    return counted - system
  }

  const paymentMethods = [
    { id: "efectivo" as const, name: "Efectivo", icon: DollarSign },
    { id: "tarjeta" as const, name: "Tarjeta", icon: CreditCard },
    { id: "yape" as const, name: "Yape/Plin", icon: Smartphone },
    { id: "transferencia" as const, name: "Transferencia", icon: Building2 },
  ]


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="flex h-screen bg-[#FFF5ED]"> {/* Fondo: Crema de Fondo */}
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#A65F33]">Reporte de Cierre de Caja</h2>
            <p className="text-base text-[#A65F33]/70">Resumen del día y arqueo de caja para el {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}.</p>
          </div>

          {/* Tarjetas de Resumen Animadas */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <SummaryCard icon={TrendingUp} title="Ventas Totales" value={`S/ ${totalSales.toFixed(2)}`} iconBgColor="bg-[#FFA142]" />
            <SummaryCard icon={DollarSign} title="Efectivo (Sistema)" value={`S/ ${systemTotals.efectivo.toFixed(2)}`} iconBgColor="bg-green-500" />
            <SummaryCard icon={CreditCard} title="Tarjeta (Sistema)" value={`S/ ${systemTotals.tarjeta.toFixed(2)}`} iconBgColor="bg-blue-500" />
            <SummaryCard icon={Smartphone} title="Yape/Plin (Sistema)" value={`S/ ${systemTotals.yape.toFixed(2)}`} iconBgColor="bg-purple-500" />
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Arqueo de Caja */}
            <Card className="lg:col-span-3 border-[#FFE0C2] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#A65F33]">Arqueo de Caja</CardTitle>
                <CardDescription className="text-[#A65F33]/70">Ingresa los montos contados para verificar las diferencias.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {paymentMethods.map((method) => {
                  const difference = getDifference(method.id)
                  const hasDifference = countedAmounts[method.id] !== ""
                  return (
                    <div key={method.id} className="grid grid-cols-12 items-center gap-4">
                      <Label htmlFor={method.id} className="col-span-12 sm:col-span-3 flex items-center gap-2 font-semibold text-[#A65F33]">
                        <method.icon size={16} /> {method.name}
                      </Label>
                      <Input
                        id={method.id}
                        type="number" step="0.01" placeholder="S/ 0.00"
                        value={countedAmounts[method.id]}
                        onChange={(e) => setCountedAmounts((prev) => ({ ...prev, [method.id]: e.target.value }))}
                        className="col-span-6 sm:col-span-3 border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33] focus:border-[#FFA142] focus:ring-[#FFA142]/50"
                      />
                      <div className="col-span-6 sm:col-span-3 rounded-lg bg-[#FFF3E5] px-3 py-2 text-center">
                        <p className="text-xs text-[#A65F33]/70">Sistema</p>
                        <p className="font-semibold text-[#A65F33]">S/ {systemTotals[method.id].toFixed(2)}</p>
                      </div>
                      <div className="col-span-12 sm:col-span-3 text-center">
                        <AnimatePresence>
                          {hasDifference && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className={cn("rounded-full px-3 py-1 text-xs font-bold",
                                difference === 0 ? "bg-green-100 text-green-700"
                                  : difference > 0 ? "bg-orange-100 text-orange-600"
                                    : "bg-red-100 text-red-600"
                              )}
                            >
                              {difference === 0 ? "✓ Cuadrado"
                                : difference > 0 ? `Sobrante: S/ ${difference.toFixed(2)}`
                                  : `Faltante: S/ ${Math.abs(difference).toFixed(2)}`}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Top 5 Platos y Rendimiento de Mozos colapsados en columnas si es necesario */}
            <div className="lg:col-span-2 space-y-8">
              {/* Ranking Mozos */}
              <div className="h-[400px]">
                <WaiterPerformance />
              </div>

              {/* Top 5 Platos */}
              <Card className="border-[#FFE0C2] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-[#A65F33]">
                    <Award size={22} className="text-amber-500" /> Top 5 Platos del Día
                  </CardTitle>
                  <CardDescription className="text-[#A65F33]/70">Productos más vendidos por ingresos generados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topDishes.map((dish, index) => {
                    const medalColors = ["text-amber-400", "text-slate-400", "text-amber-600"]
                    const barWidth = (dish.revenue / topDishes[0].revenue) * 100
                    return (
                      <div key={dish.name} className="flex items-center gap-4">
                        {index < 3 ? <Award size={24} className={medalColors[index]} fill="currentColor" /> : <div className="w-6 text-center font-bold text-[#A65F33]/50">{index + 1}</div>}
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <p className="font-semibold text-[#A65F33]">{dish.name}</p>
                            <p className="text-sm font-bold text-[#FFA142]">S/ {dish.revenue.toFixed(2)}</p>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-[#FFF3E5]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="h-full rounded-full bg-gradient-to-r from-[#FFB167] to-[#FFA142]"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button size="lg" className="px-8 h-12 text-base bg-[#FFA142] text-white shadow-lg shadow-orange-300/60 hover:bg-[#FFB167] hover:-translate-y-0.5 transition-all duration-300">
              <CheckCircle2 className="mr-2 h-5 w-5" /> Finalizar y Cerrar Día
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
