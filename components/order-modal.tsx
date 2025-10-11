"use client"

import { useState } from "react"
// Importa las herramientas de animación y los nuevos iconos
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Send,
  Soup,
  Utensils,
  GlassWater,
  CakeSlice,
  ClipboardList,
} from "lucide-react"
import type { Table, OrderItem } from "@/lib/store"
import { usePOSStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface OrderModalProps {
  table: Table
  onClose: () => void
}

// Objeto de categorías con iconos para un código más limpio
const categories = [
  { name: "Entradas", icon: Soup },
  { name: "Fondos", icon: Utensils },
  { name: "Bebidas", icon: GlassWater },
  { name: "Postres", icon: CakeSlice },
]

export function OrderModal({ table, onClose }: OrderModalProps) {
  const { menuItems, addOrderToTable, sendToKitchen, updateTableNotes } = usePOSStore()
  const [selectedCategory, setSelectedCategory] = useState("Entradas")
  const [currentOrders, setCurrentOrders] = useState<OrderItem[]>([...table.orders])
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")
  const [tableNote, setTableNote] = useState(table.notes || "")

  const filteredItems = menuItems.filter((item) => item.category === selectedCategory)

  const addItem = (menuItem: (typeof menuItems)[0]) => {
    const existingIndex = currentOrders.findIndex((o) => o.menuItemId === menuItem.id && !o.notes)
    if (existingIndex >= 0) {
      const updated = [...currentOrders]
      updated[existingIndex].quantity += 1
      setCurrentOrders(updated)
    } else {
      setCurrentOrders([
        ...currentOrders,
        {
          id: `order-${Date.now()}-${Math.random()}`,
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: 1,
          price: menuItem.price,
        },
      ])
    }
  }

  const updateQuantity = (orderId: string, delta: number) => {
    setCurrentOrders((orders) =>
      orders
        .map((order) => (order.id === orderId ? { ...order, quantity: Math.max(0, order.quantity + delta) } : order))
        .filter((order) => order.quantity > 0),
    )
  }

  const removeItem = (orderId: string) => {
    setCurrentOrders((orders) => orders.filter((order) => order.id !== orderId))
  }

  const saveNotes = (orderId: string) => {
    setCurrentOrders((orders) =>
      orders.map((order) => (order.id === orderId ? { ...order, notes: noteText || undefined } : order)),
    )
    setEditingNotes(null)
    setNoteText("")
  }

  const handleSendToKitchen = () => {
    updateTableNotes(table.id, tableNote)
    addOrderToTable(table.id, currentOrders)
    sendToKitchen(table.id)
    onClose()
  }

  const total = currentOrders.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // --- Variantes de Animación para Framer Motion ---
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        type: "spring" as const, 
        duration: 0.4, 
        ease: [0.42, 0, 0.58, 1] // cubic-bezier for easeInOut
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      transition: { 
        duration: 0.2, 
        ease: [0.42, 0, 1, 1] // cubic-bezier for easeIn
      } 
    },
  }

  const menuListVariants = {
    visible: { transition: { staggerChildren: 0.05 } },
  }

  const menuItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const orderItemVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex h-[95vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        {/* --- Lado Izquierdo - Menú --- */}
        <div className="flex w-3/5 flex-col border-r border-border/50">
          <div className="border-b border-border/50 p-4">
            <h2 className="font-display text-2xl font-bold text-foreground">Menú</h2>
          </div>

          {/* --- Pestañas de Categoría con Animación --- */}
          <div className="relative flex border-b border-border/50">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors focus:outline-none",
                  selectedCategory === category.name ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            ))}
            {/* --- Indicador Deslizante --- */}
            <motion.div
              className="absolute bottom-0 h-0.5 bg-primary"
              layoutId="underline"
              style={{
                width: `${100 / categories.length}%`,
                left: `${(categories.findIndex((c) => c.name === selectedCategory) * 100) / categories.length}%`,
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          </div>

          {/* --- Ítems del Menú con Animación --- */}
          <div className="flex-1 overflow-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                variants={menuListVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredItems.map((item) => (
                  <motion.div variants={menuItemVariants} key={item.id}>
                    <div
                      className={cn(
                        "group flex h-full flex-col gap-2 rounded-lg border border-border/50 bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1",
                        !item.available && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <div className="flex flex-1 items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <p className="text-xl font-bold text-primary">S/ {item.price.toFixed(2)}</p>
                        </div>
                        <Button
                          size="icon"
                          onClick={() => addItem(item)}
                          disabled={!item.available}
                          className="h-9 w-9 shrink-0 rounded-full transition-transform group-hover:scale-110"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      {!item.available && <span className="text-xs font-medium text-destructive">Agotado</span>}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* --- Lado Derecho - Resumen del Pedido --- */}
        <div className="flex w-2/5 flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border/50 p-4">
            <h2 className="font-display text-2xl font-bold text-foreground">Mesa {table.number}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col overflow-auto p-4">
            <div className="mb-4">
              <label htmlFor="table-note" className="mb-2 block text-sm font-medium text-muted-foreground">
                Nota General del Pedido
              </label>
              <Textarea
                id="table-note"
                placeholder="Ej: Cliente alérgico, para llevar, etc."
                value={tableNote}
                onChange={(e) => setTableNote(e.target.value)}
                className="resize-none bg-card"
                rows={2}
              />
            </div>

            {/* --- Lista de Pedidos con Animación --- */}
            <div className="flex-1">
              {currentOrders.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
                  <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                  <span>Agrega ítems del menú para</span>
                  <span>empezar un nuevo pedido.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {currentOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        variants={orderItemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="overflow-hidden rounded-lg border border-border/50 bg-card p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{order.name}</h4>
                            <p className="text-sm text-muted-foreground">S/ {order.price.toFixed(2)}</p>
                            {order.notes && (
                              <p className="mt-1 text-xs italic text-blue-500">Nota: {order.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 rounded-full border border-border bg-background p-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateQuantity(order.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-bold">{order.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateQuantity(order.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {editingNotes === order.id ? (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-2 flex gap-2">
                            <Input
                              placeholder="Ej: Sin ají, término medio..."
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="h-8 text-xs"
                              autoFocus
                            />
                            <Button size="sm" onClick={() => saveNotes(order.id)} className="h-8">
                              OK
                            </Button>
                          </motion.div>
                        ) : (
                          <div className="mt-2 flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-muted-foreground"
                              onClick={() => {
                                setEditingNotes(order.id)
                                setNoteText(order.notes || "")
                              }}
                            >
                              <Edit2 className="mr-1 h-3 w-3" />
                              Nota
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                              onClick={() => removeItem(order.id)}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Eliminar
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-border/50 bg-card/50 p-4 shadow-[0_-10px_15px_-3px_rgb(0,0,0,0.02)]">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-lg font-bold text-foreground">Total</span>
              <span className="font-display text-3xl font-bold text-primary">S/ {total.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSendToKitchen}
                disabled={currentOrders.length === 0}
                className={cn("flex-1", currentOrders.length > 0 && "animate-pulse")}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar a Cocina
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}