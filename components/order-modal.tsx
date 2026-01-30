
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Plus, Minus, Trash2, Edit2, Send, Soup, Utensils, GlassWater, CakeSlice, ClipboardList,
  Loader2, CookingPot, Bell, CheckCircle2, Store, ShoppingBag, Bike, Drumstick, Flame, UtensilsCrossed, Wine, Search, DollarSign // ✨ Nuevos íconos
} from "lucide-react"
import type { Table, OrderItem, OrderItemStatus, MenuItem as MenuItemType, OrderType } from "@/lib/store"
import { usePOSStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { printTicket } from "@/components/print-ticket"
import { PaymentDialog } from "@/components/payment-dialog"

interface OrderModalProps {
  table: Table
  onClose: () => void
}

// Objeto de categorías con iconos Y su sitio correspondiente
const categories: Array<{ name: string; icon: any; site: Array<"polleria" | "restaurante"> }> = [
  // Pollería
  { name: "Pollos a la brasa", icon: Drumstick, site: ["polleria"] },
  { name: "Parrillas", icon: Flame, site: ["polleria"] },
  { name: "Chaufas", icon: UtensilsCrossed, site: ["polleria"] },
  // Restaurante
  { name: "Segundos", icon: Utensils, site: ["restaurante"] },
  { name: "Sopas", icon: Soup, site: ["restaurante"] },
  { name: "Licores", icon: Wine, site: ["restaurante"] },
  // Compartido (aparece en ambos)
  { name: "Gaseosas", icon: GlassWater, site: ["polleria", "restaurante"] },
]

export function OrderModal({ table, onClose }: OrderModalProps) {
  const { menuItems, addOrderToTable, updateTableNotes, addNotification, updateOrderItemStatus, currentUser, menus } = usePOSStore();

  // ✅ Estado para la sede seleccionada (por defecto la del usuario)
  const [selectedSite, setSelectedSite] = useState<"polleria" | "restaurante">(currentUser?.site || "restaurante");

  // ✅ Calculamos las categorías iniciales disponibles para inicializar correctamente selectedCategory
  const initialAvailableCategories = categories.filter(cat => cat.site.includes(selectedSite));

  const [selectedCategory, setSelectedCategory] = useState(initialAvailableCategories[0]?.name || "Pollos a la brasa");

  // ✅ Estado para el tipo de pedido (por defecto "mesa")
  const [orderType, setOrderType] = useState<OrderType>(table.orderType || "mesa");
  // ✅ Estado para el menú activo (por defecto "all" o todos)
  const [activeMenuId, setActiveMenuId] = useState<string | "all">("all");

  // ✅ Estado local SOLO para los NUEVOS items que se están añadiendo
  const [newItems, setNewItems] = useState<Omit<OrderItem, "id" | "status">[]>([]);

  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [tableNote, setTableNote] = useState(table.notes || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // ✅ Filtrar categorías disponibles según el sitio seleccionado
  const availableCategories = categories.filter(cat => cat.site.includes(selectedSite));

  // ✅ Filtrar items por sede seleccionada, categoría Y término de búsqueda
  // ✅ Filtrar items por sede seleccionada, categoría Y término de búsqueda Y Menú Activo
  const activeMenu = activeMenuId !== "all" ? menus.find(m => m.id === activeMenuId) : null;

  const filteredMenuItems = menuItems.filter(
    (item) => {
      // DEBUG: Log item if it looks like a "Segundo" to see why it fails
      // console.log(`Checking item: ${item.name}`, { itemSites: item.sites, selectedSite, itemCat: item.category, selectedCategory });

      // 0. Legacy Data Safeguard
      // If item.sites is missing, try to use item.site or default to empty
      const itemSites = item.sites || ((item as any).site ? [(item as any).site] : []);

      // 1. Site Filter
      if (!itemSites.includes(selectedSite)) return false;

      // 2. Category Filter
      if (item.category !== selectedCategory) return false;

      // 3. Search Filter
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // 4. Menu Template Filter
      if (activeMenu && !activeMenu.items.includes(item.id)) return false;

      return true;
    }
  );

  // ✅ Efecto para cambiar a la primera categoría disponible cuando se cambia de sitio
  useEffect(() => {
    const firstCategory = availableCategories[0]?.name;
    if (firstCategory && !availableCategories.some(cat => cat.name === selectedCategory)) {
      setSelectedCategory(firstCategory);
    }
    // Limpiar búsqueda al cambiar de sitio
    setSearchTerm("");
  }, [selectedSite]);


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
          orderType: orderType, // ✅ Usar el orderType del estado general como default
        },
      ]);
    }
  };

  // ✅ Función para actualizar el orderType de un item específico
  const updateItemOrderType = (itemIndex: number, newOrderType: OrderType) => {
    setNewItems((currentItems) =>
      currentItems.map((item, index) =>
        index === itemIndex ? { ...item, orderType: newOrderType } : item
      )
    );
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
    addOrderToTable(table.id, newItems, orderType);

    // 🚫 La vieja llamada a `sendToKitchen(table.id)` ya NO es necesaria y se elimina.

    // 3. Muestra una notificación de éxito
    addNotification({
      type: "success",
      message: `Items para la Mesa ${table.number} enviados automáticamente a cocina(s).`,
    });

    // ✅ 4. Imprimir el ticket automáticamente
    printTicket(table, newItems, table.orders.length > 0 ? Math.floor(table.orders.length / 5) + 1 : 1);

    // 5. Limpia los nuevos items y cierra el modal
    setNewItems([]);
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
          <div className="border-b border-[#FFE0C2] p-4 flex justify-between items-center bg-white/50">
            <h2 className="text-2xl font-bold text-[#A65F33]">Menú</h2>
            {/* Selector de Plantilla de Menú */}
            {menus.filter(m => m.isActive).length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#A65F33]/60 uppercase tracking-wide">Plantilla:</span>
                <select
                  value={activeMenuId}
                  onChange={(e) => setActiveMenuId(e.target.value)}
                  className="text-sm border-none bg-orange-100 text-orange-800 font-bold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-400 cursor-pointer outline-none shadow-sm"
                >
                  <option value="all">Carta Completa</option>
                  {menus.filter(m => m.isActive).map(menu => (
                    <option key={menu.id} value={menu.id}>{menu.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ✅ Tabs para cambiar entre Pollería y Restaurante */}
          <div className="flex gap-2 border-b border-[#FFE0C2] px-4 py-2 bg-[#FFF3E5]">
            <button
              onClick={() => setSelectedSite("restaurante")}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                selectedSite === "restaurante"
                  ? "bg-[#7DBB3C] text-white shadow-md"
                  : "bg-white text-[#A65F33] hover:bg-[#FFE0C2]"
              )}
            >
              🍽️ Restaurante
            </button>
            <button
              onClick={() => setSelectedSite("polleria")}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                selectedSite === "polleria"
                  ? "bg-[#FFA142] text-white shadow-md"
                  : "bg-white text-[#A65F33] hover:bg-[#FFE0C2]"
              )}
            >
              🍗 Pollería
            </button>
          </div>

          {/* --- Pestañas de Categoría con la nueva paleta y microinteracciones --- */}
          <div className="relative flex border-b border-[#FFE0C2]">
            {availableCategories.map((category) => (
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
                width: `${100 / availableCategories.length}%`,
                left: `${(availableCategories.findIndex((c) => c.name === selectedCategory) * 100) / availableCategories.length}%`,
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          </div>

          {/* \u2705 Cuadro de B\u00fasqueda */}
          <div className="border-b border-[#FFE0C2] bg-[#FFF5ED] px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A65F33]/50" />
              <Input
                type="text"
                placeholder="Buscar platos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border-[#FFE0C2] bg-white pl-10 pr-10 text-sm text-[#A65F33] placeholder:text-[#A65F33]/40 focus:border-[#FFA142] focus:ring-[#FFA142]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A65F33]/50 hover:text-[#A65F33]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* --- \u00cdtems del Men\u00fa con la nueva paleta y microinteracciones --- */}
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
                        "group flex h-36 cursor-pointer flex-col justify-between rounded-xl border bg-white shadow-sm transition-all duration-300 relative overflow-hidden",
                        "border-[#FFE0C2] hover:border-[#FFA142] hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 hover:scale-[1.02]",
                        !item.available && "cursor-not-allowed opacity-60 grayscale-[0.8]",
                      )}
                    >
                      {/* Image Background */}
                      {item.image && (
                        <div className="absolute inset-0 z-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-100"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('hidden');
                            }}
                          />
                          {/* Enhanced Gradient for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
                        </div>
                      )}

                      {/* Content Overlay */}
                      <div className="relative z-10 flex flex-1 flex-col justify-between p-3.5 h-full">
                        <div className="flex justify-between items-start">
                          <div className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md border border-white/10",
                            item.sites?.includes("polleria")
                              ? "bg-[#FFA142]/90 text-white"
                              : "bg-[#7DBB3C]/90 text-white"
                          )}>
                            {item.sites?.includes("polleria") ? "🍗" : "🍽️"}
                          </div>

                          <Button
                            size="icon"
                            disabled={!item.available}
                            className={cn(
                              "h-8 w-8 shrink-0 rounded-full text-white shadow-lg transition-all group-hover:scale-110 active:scale-95 flex items-center justify-center",
                              item.image ? "bg-white/20 backdrop-blur-md hover:bg-white/40 border border-white/20" : "bg-[#FFA142] hover:bg-[#FFB167]"
                            )}
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="mt-auto">
                          <h3 className={cn("font-bold leading-tight mb-1 line-clamp-2 text-sm", item.image ? "text-white text-shadow-sm" : "text-[#A65F33]")}>{item.name}</h3>
                          <p className={cn("text-lg font-extrabold", item.image ? "text-[#FFA142]" : "text-[#FFA142]")}>S/ {item.price.toFixed(2)}</p>
                        </div>
                      </div>

                      {!item.available && (
                        <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-200 shadow-sm animate-pulse">Agotado</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredMenuItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-[#A65F33]/60">
                <div className="bg-orange-100 p-4 rounded-full mb-3">
                  <Search className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-semibold text-lg">No se encontraron platos</p>
                <p className="text-sm">Intenta cambiar la categoría o el filtro.</p>
              </div>
            )}
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

          {/* ✨ NUEVO: Selector de Tipo de Pedido */}
          <div className="border-b border-[#FFE0C2] bg-[#FFF5ED] p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#A65F33]/70">Tipo de Pedido</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setOrderType("mesa")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
                  orderType === "mesa"
                    ? "bg-[#FFA142] text-white shadow-md scale-105"
                    : "bg-white text-[#A65F33] hover:bg-[#FFE0C2] border border-[#FFE0C2]"
                )}
              >
                <Store className="h-4 w-4" />
                <span>Consumo en Mesa</span>
              </button>
              <button
                onClick={() => setOrderType("para-llevar")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
                  orderType === "para-llevar"
                    ? "bg-[#FFA142] text-white shadow-md scale-105"
                    : "bg-white text-[#A65F33] hover:bg-[#FFE0C2] border border-[#FFE0C2]"
                )}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Para Llevar</span>
              </button>
              <button
                onClick={() => setOrderType("delivery")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
                  orderType === "delivery"
                    ? "bg-[#FFA142] text-white shadow-md scale-105"
                    : "bg-white text-[#A65F33] hover:bg-[#FFE0C2] border border-[#FFE0C2]"
                )}
              >
                <Bike className="h-4 w-4" />
                <span>Delivery</span>
              </button>
            </div>
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

                        {/* ✅ Selector de Tipo de Pedido para cada item */}
                        <div className="mt-3 border-t border-[#FFE0C2] pt-3">
                          <p className="text-[10px] font-semibold uppercase text-[#A65F33]/60 mb-1.5">Tipo de Pedido</p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => updateItemOrderType(index, "mesa")}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-all",
                                order.orderType === "mesa"
                                  ? "bg-[#7DBB3C] text-white shadow-sm"
                                  : "bg-white text-[#A65F33]/70 hover:bg-[#FFE0C2] border border-[#FFE0C2]"
                              )}
                            >
                              <Store className="h-3 w-3" />
                              <span>Mesa</span>
                            </button>
                            <button
                              onClick={() => updateItemOrderType(index, "para-llevar")}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-all",
                                order.orderType === "para-llevar"
                                  ? "bg-[#FFA142] text-white shadow-sm"
                                  : "bg-white text-[#A65F33]/70 hover:bg-[#FFE0C2] border border-[#FFE0C2]"
                              )}
                            >
                              <ShoppingBag className="h-3 w-3" />
                              <span>Llevar</span>
                            </button>
                            <button
                              onClick={() => updateItemOrderType(index, "delivery")}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-all",
                                order.orderType === "delivery"
                                  ? "bg-purple-500 text-white shadow-sm"
                                  : "bg-white text-[#A65F33]/70 hover:bg-[#FFE0C2] border border-[#FFE0C2]"
                              )}
                            >
                              <Bike className="h-3 w-3" />
                              <span>Delivery</span>
                            </button>
                          </div>
                        </div>
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
              {table.orders.length > 0 && (
                <Button
                  onClick={() => setIsPaymentDialogOpen(true)}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Cerrar Cuenta
                </Button>
              )}
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
                {table.orders.length > 0 ? "Añadir Items" : "Confirmar Pedido"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payment Dialog */}
      <PaymentDialog
        table={table}
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
      />
    </div>
  )
}