"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePOSStore } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { TrendingUp, DollarSign, CreditCard, Smartphone, Building2, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Reporte de Cierre de Caja</h2>
            <p className="text-sm text-muted-foreground">Resumen del día y arqueo de caja</p>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold text-primary">S/ {totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total del día</p>
              </CardContent>
            </Card>

            {paymentMethods.slice(0, 3).map((method) => {
              const Icon = method.icon
              return (
                <Card key={method.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{method.name}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">S/ {systemTotals[method.id].toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Según sistema</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Cash Reconciliation */}
            <Card>
              <CardHeader>
                <CardTitle>Arqueo de Caja</CardTitle>
                <CardDescription>Ingrese los montos contados físicamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const difference = getDifference(method.id)
                  const hasDifference = countedAmounts[method.id] !== ""

                  return (
                    <div key={method.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={method.id}>{method.name}</Label>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            id={method.id}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={countedAmounts[method.id]}
                            onChange={(e) => setCountedAmounts((prev) => ({ ...prev, [method.id]: e.target.value }))}
                          />
                        </div>
                        <div className="w-32 rounded-lg bg-muted px-3 py-2 text-center">
                          <p className="text-xs text-muted-foreground">Sistema</p>
                          <p className="font-semibold">S/ {systemTotals[method.id].toFixed(2)}</p>
                        </div>
                      </div>
                      {hasDifference && (
                        <div
                          className={`rounded-lg p-2 text-center text-sm font-semibold ${
                            difference === 0
                              ? "bg-success/10 text-success"
                              : difference > 0
                                ? "bg-warning/10 text-warning"
                                : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {difference === 0
                            ? "✓ Cuadrado"
                            : difference > 0
                              ? `Sobrante: S/ ${difference.toFixed(2)}`
                              : `Faltante: S/ ${Math.abs(difference).toFixed(2)}`}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Top Dishes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-warning" />
                  Top 5 Platos del Día
                </CardTitle>
                <CardDescription>Platos más vendidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDishes.map((dish, index) => (
                    <div key={dish.name} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{dish.name}</p>
                        <p className="text-sm text-muted-foreground">{dish.quantity} unidades vendidas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">S/ {dish.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button size="lg" className="px-8">
              Finalizar y Cerrar Día
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
