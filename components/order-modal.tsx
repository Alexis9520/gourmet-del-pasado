
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Plus, Minus, Trash2, Edit2, Send, Soup, Utensils, GlassWater, CakeSlice, ClipboardList,
  Loader2, CookingPot, Bell, CheckCircle2 // ✨ Nuevos íconos de estado
} from "lucide-react"
import type { Table, OrderItem, OrderItemStatus, MenuItem as MenuItemType } from "@/lib/store"
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
  const { menuItems, addOrderToTable, updateTableNotes, addNotification, updateOrderItemStatus } = usePOSStore();
  const [selectedCategory, setSelectedCategory] = useState("Entradas");

  // ✨ Estado local SOLO para los NUEVOS items que se están añadiendo
  const [newItems, setNewItems] = useState<Omit<OrderItem, "id" | "status">[]>([]);

  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [tableNote, setTableNote] = useState(table.notes || "");

  const filteredMenuItems = menuItems.filter((item) => item.category === selectedCategory);


  // Lógica para añadir items al estado local `newItems`
  const addItem = (menuItem: MenuItemType) => {
    const existingIndex = newItems.findIndex((o) => o.menuItemId === menuItem.id && !o.notes);
    if (existingIndex >= 0) {
      const updated = [...newItems];
      updated[existingIndex].quantity += 1;
      setNewItems(updated);
    } else {
      setNewItems([
        ...newItems,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: 1,
          price: menuItem.price,
        },
      ]);
    }
  };

  const updateQuantity = (itemIndex: number, delta: number) => {
    setNewItems((currentItems) =>
      currentItems
        .map((item, index) =>
          index === itemIndex
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0) // Elimina el item si su cantidad llega a 0
    );
  };


  const removeItem = (itemIndex: number) => {
    setNewItems((currentItems) =>
      currentItems.filter((_, index) => index !== itemIndex)
    );
  };

  const saveNotes = (itemIndex: number) => {
    setNewItems((currentItems) =>
      currentItems.map((item, index) =>
        index === itemIndex ? { ...item, notes: noteText || undefined } : item
      )
    );
    setEditingNotes(null); // Asumiendo que 'editingNotes' ahora guarda el índice
    setNoteText("");
  };
  // ✨ La función de envío ahora es más simple y tiene un nombre más claro
  const handleConfirmAndSend = () => {
    // Solo actúa si hay nuevos items para enviar
    if (newItems.length === 0) return;

    // 1. (Opcional) Guarda la nota general de la mesa
    updateTableNotes(table.id, tableNote);

    // 2. Envía los nuevos items al store. La función ya los marca como 'pendiente'
    addOrderToTable(table.id, newItems);

    // 🚫 La vieja llamada a `sendToKitchen(table.id)` ya NO es necesaria y se elimina.

    // 3. Muestra una notificación de éxito
    addNotification({
      type: "success",
      message: `Nuevos items para la Mesa ${table.number} enviados a cocina.`,
    });

    // 4. Cierra el modal
    onClose();
  };
  const statusConfig = {
    pendiente: { icon: Loader2, color: 'text-orange-500', label: 'En cola', animate: 'animate-spin' },
    'en preparación': { icon: CookingPot, color: 'text-blue-500', label: 'Preparando', animate: '' },
    listo: { icon: Bell, color: 'text-green-500', label: '¡Listo!', animate: 'animate-bounce' },
    servido: { icon: CheckCircle2, color: 'text-gray-400', label: 'Servido', animate: '' },
    cancelado: { icon: CheckCircle2, color: 'text-red-500', label: 'Cancelado', animate: '' }
  };

  const total = [...table.orders, ...newItems].reduce((sum, item) => sum + item.price * item.quantity, 0);


  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        duration: 0.4,
        ease: [0.42, 0, 0.58, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: [0.42, 0, 1, 1],
      },
    },
  } as const

  const menuListVariants = {
    visible: { transition: { staggerChildren: 0.05 } },
  } as const

  const menuItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  } as const

  const orderItemVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  } as const

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans backdrop-blur-sm">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex h-[95vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-[#FFF3E5] shadow-2xl"
      >
        {/* --- Lado Izquierdo - Menú (Sin cambios funcionales) --- */}
        <div className="flex w-3/5 flex-col border-r border-[#FFE0C2]">
          {/* ... (Tu código del Header, Pestañas de Categoría e Items del Menú va aquí, no necesita cambios) ... */}
          {/* Asegúrate de que los botones de este lado llamen a addItem(item), que modifica `newItems` */}
          <div className="border-b border-[#FFE0C2] p-4">
            <h2 className="text-2xl font-bold text-[#A65F33]">Menú</h2> {/* Texto: Marrón Oscuro */}
          </div>

          {/* --- Pestañas de Categoría con la nueva paleta y microinteracciones --- */}
          <div className="relative flex border-b border-[#FFE0C2]">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-t-md px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA142]",
                  selectedCategory === category.name
                    ? "text-[#FFA142]" // Naranja Principal (activo)
                    : "text-[#A65F33]/70 hover:text-[#A65F33] hover:bg-[#FFE0C2]/50", // Marrón Oscuro y hover sutil
                )}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            ))}
            <motion.div
              className="absolute bottom-0 h-0.5 bg-[#FFA142]" // Naranja Principal
              layoutId="underline"
              style={{
                width: `${100 / categories.length}%`,
                left: `${(categories.findIndex((c) => c.name === selectedCategory) * 100) / categories.length}%`,
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          </div>

          {/* --- Ítems del Menú con la nueva paleta y microinteracciones --- */}
          <div className="flex-1 overflow-auto bg-[#FFF5ED] p-4"> {/* Fondo: Crema de Fondo */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                variants={menuListVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredMenuItems.map((item: MenuItemType) => (
                  <motion.div variants={menuItemVariants} key={item.id}>
                    <div
                      onClick={() => item.available && addItem(item)}
                      className={cn(
                        "group flex h-full cursor-pointer flex-col gap-2 rounded-lg border bg-white p-4 shadow-sm transition-all duration-300",
                        "border-[#FFE0C2] hover:border-[#FFA142] hover:shadow-lg hover:shadow-orange-200/50 hover:-translate-y-1 hover:scale-[1.02]", // Efectos de hover
                        !item.available && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <div className="flex flex-1 items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-[#A65F33]">{item.name}</h3>
                          <p className="text-xl font-bold text-[#FFA142]">S/ {item.price.toFixed(2)}</p>
                        </div>
                        <Button
                          size="icon"
                          disabled={!item.available}
                          className="h-9 w-9 shrink-0 rounded-full bg-[#FFA142] text-white shadow-sm transition-all group-hover:scale-110 group-hover:bg-[#FFB167] active:scale-95" // Microinteracciones
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      {!item.available && <span className="text-xs font-medium text-red-500">Agotado</span>}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* --- ✨ Lado Derecho - Resumen del Pedido (REFACTORIZADO) --- */}
        <div className="flex w-2/5 flex-col bg-[#FFF3E5]">
          <div className="flex items-center justify-between border-b border-[#FFE0C2] p-4">
            <h2 className="text-2xl font-bold text-[#A65F33]">Mesa {table.number}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-[#A65F33]/70 hover:bg-[#FFE0C2] hover:text-[#A65F33]">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col overflow-auto p-4">

            {/* --- Sección 1: Platos ya en proceso --- */}
            {table.orders.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold uppercase text-[#A65F33]/70 mb-2">En Proceso</h3>
                <div className="space-y-2">
                  {table.orders.map(order => {
                    const config = statusConfig[order.status];
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-white/60 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{order.quantity}x {order.name}</p>
                          {order.notes && <p className="text-xs text-gray-500 italic">Nota: {order.notes}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className={cn("flex items-center gap-1.5 text-xs font-bold", config.color)}>
                            <Icon size={14} className={config.animate} />
                            <span>{config.label}</span>
                          </div>
                          {order.status === 'listo' && (
                            <Button
                              size="sm"
                              className="h-6 text-xs bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => updateOrderItemStatus(table.id, order.id, 'servido')}
                            >
                              Marcar Servido
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- Sección 2: Nuevos items para añadir --- */}
            <div>
              <h3 className="text-sm font-bold uppercase text-[#A65F33]/70 mb-2">
                {table.orders.length > 0 ? "Añadir al Pedido" : "Nuevo Pedido"}
              </h3>
              {newItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-[#A65F33]/60 py-8">
                  <ClipboardList className="h-12 w-12" />
                  <span>Agrega ítems del menú.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {newItems.map((order, index) => (
                      <motion.div
                        key={index} // Usamos el índice como key para items temporales
                        layout
                        variants={orderItemVariants}
                        initial="initial" animate="animate" exit="exit"
                        className="overflow-hidden rounded-lg border border-[#FFE0C2] bg-white p-3 shadow-sm"
                      >
                        {/* ... (Este es tu JSX de item editable, adaptado para usar 'index') ... */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#A65F33]">{order.name}</h4>
                            <p className="text-sm text-[#A65F33]/80">S/ {order.price.toFixed(2)}</p>
                            {order.notes && (<p className="mt-1 text-xs italic text-blue-600">Nota: {order.notes}</p>)}
                          </div>
                          <div className="flex items-center gap-1 rounded-full border border-[#FFE0C2] bg-[#FFF5ED] p-0.5">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-[#A65F33]" onClick={() => updateQuantity(index, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-bold text-[#A65F33]">{order.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-[#A65F33]" onClick={() => updateQuantity(index, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {editingNotes === `item-${index}` ? (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-2 flex gap-2">
                            <Input placeholder="Ej: Sin ají..." value={noteText} onChange={(e) => setNoteText(e.target.value)} className="h-8 text-xs ..." autoFocus />
                            <Button size="sm" onClick={() => saveNotes(index)} className="h-8 ...">OK</Button>
                          </motion.div>
                        ) : (
                          <div className="mt-2 flex gap-2">
                            <Button variant="ghost" size="sm" className="h-7 text-xs ..." onClick={() => { setEditingNotes(`item-${index}`); setNoteText(order.notes || ""); }}>
                              <Edit2 className="mr-1 h-3 w-3" />Nota
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500/80 hover:text-red-500" onClick={() => removeItem(index)}>
                              <Trash2 className="mr-1 h-3 w-3" />Eliminar
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* --- Nota general (sin cambios funcionales) --- */}
            <div className="mt-4">
              <label htmlFor="table-note" className="mb-2 block text-sm font-medium text-[#A65F33]/80">
                Nota General del Pedido
              </label>
              <Textarea
                id="table-note"
                placeholder="Ej: Cliente alérgico, para llevar, etc."
                value={tableNote}
                onChange={(e) => setTableNote(e.target.value)}
                className="resize-none border-[#FFE0C2] bg-[#F4EFDF] ..."
                rows={2}
              />
            </div>

          </div>

          {/* --- Pie del Modal (ACTUALIZADO) --- */}
          <div className="mt-auto border-t border-[#FFE0C2] bg-white/50 p-4 shadow-[0_-10px_15px_-3px_rgb(0,0,0,0.02)]">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-lg font-bold text-[#A65F33]">Total Cuenta</span>
              <span className="text-3xl font-bold text-[#FFA142]">S/ {total.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-[#FFE0C2] bg-transparent text-[#A65F33] transition-colors hover:bg-[#FFE0C2] hover:text-[#A65F33]"
              >
                Cerrar
              </Button>
              <Button
                onClick={handleConfirmAndSend}
                disabled={newItems.length === 0}
                className={cn(
                  "flex-1 text-white shadow-sm transition-all duration-300",
                  "bg-[#FFA142] hover:bg-[#FFB167] hover:shadow-lg hover:shadow-orange-400/40 hover:-translate-y-0.5",
                  "disabled:bg-orange-300 disabled:shadow-none disabled:translate-y-0",
                  newItems.length > 0 && "animate-pulse"
                )}
              >
                <Send className="mr-2 h-4 w-4" />
                {table.orders.length > 0 ? "Añadir y Enviar" : "Enviar a Cocina"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}