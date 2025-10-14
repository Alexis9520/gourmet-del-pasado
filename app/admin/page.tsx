"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { usePOSStore } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DishFormModal } from "@/components/dish-form-modal"
import { Plus, Edit2, Trash2, Utensils, CupSoda, IceCream, Salad, Search, CheckCircle2, XCircle, SearchX } from "lucide-react" // Importamos nuevos iconos
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { MenuItem } from "@/lib/store"
import { JSX } from "react/jsx-runtime"
import { cn } from "@/lib/utils"

const categoryIcons: Record<string, JSX.Element> = {
  Entradas: <Salad size={20} className="text-[#A65F33]/80" />,
  Fondos: <Utensils size={20} className="text-[#A65F33]/80" />,
  Bebidas: <CupSoda size={20} className="text-[#A65F33]/80" />,
  Postres: <IceCream size={20} className="text-[#A65F33]/80" />
}


export default function AdminPage() {
  const router = useRouter()
  const { currentUser, menuItems, toggleMenuItemAvailability, addMenuItem, updateMenuItem, deleteMenuItem } =
    usePOSStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDish, setEditingDish] = useState<MenuItem | undefined>(undefined)
  const [dishToDelete, setDishToDelete] = useState<MenuItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
    }
  }, [currentUser, router])

  if (!currentUser || currentUser.role !== "admin") return null

  const categories = ["Entradas", "Fondos", "Bebidas", "Postres"]

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const categoryMatch = activeCategory === "All" || item.category === activeCategory;
      const searchMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [menuItems, activeCategory, searchTerm]);
  const handleAddDish = () => {
    setEditingDish(undefined)
    setIsModalOpen(true)
  }

  const handleEditDish = (dish: MenuItem) => {
    setEditingDish(dish)
    setIsModalOpen(true)
  }
  const handleSubmitDish = (dish: Omit<MenuItem, "id">) => {
    if (editingDish) {
      updateMenuItem(editingDish.id, dish);
    } else {
      addMenuItem(dish);
    }
  }
  const handleConfirmDelete = () => {
    if (dishToDelete) {
      deleteMenuItem(dishToDelete.id);
      setDishToDelete(null);
    }
  }
  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  if (!currentUser || currentUser.role !== "admin") return null

  return (
    <div className="flex h-screen bg-[#FFF5ED]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-7xl mx-auto">
            {/* Cabecera y botón de añadir */}
            <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-[#A65F33]">Gestión de Menú</h2>
                <p className="text-base text-[#A65F33]/70">Añade, edita y gestiona la disponibilidad de tus platos.</p>
              </div>
              <Button onClick={handleAddDish} className="h-12 px-6 text-base font-semibold bg-[#FFA142] text-white shadow-lg shadow-orange-300/60 hover:bg-[#FFB167] hover:-translate-y-0.5 transition-all duration-300">
                <Plus className="mr-2 h-5 w-5" /> Añadir Plato
              </Button>
            </motion.div>

            {/* Filtros de Categoría */}
            <motion.div variants={itemVariants} className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {["All", ...categories].map((category) => {
                const isAll = category === "All";
                const relevantItems = isAll ? menuItems : menuItems.filter(i => i.category === category);
                const count = relevantItems.length;
                const availableCount = relevantItems.filter(i => i.available).length;
                const unavailableCount = count - availableCount;
                const isActive = activeCategory === category;

                return (
                  <button key={category} onClick={() => setActiveCategory(category)} className="relative rounded-xl p-4 text-left bg-white border border-[#FFE0C2] hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300">
                    {isActive && <motion.div layoutId="activeCategory" className="absolute inset-0 rounded-xl bg-[#FFA142]/10 border-2 border-[#FFA142]" />}
                    <div className="relative z-10">
                      <div className="text-[#A65F33]/80">{isAll ? <Utensils size={24} /> : categoryIcons[category]}</div>
                      <h3 className="mt-2 text-lg font-bold text-[#A65F33]">{isAll ? 'Todos' : category}</h3>
                      <p className="text-sm text-[#A65F33]/70">{count} {count === 1 ? 'ítem' : 'ítems'}</p>
                      {/* ✅ CAMBIO: Estadísticas de disponibilidad añadidas */}
                      <div className="mt-2 flex items-center gap-3 text-xs font-medium">
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={14} /> {availableCount} Disp.</span>
                        {unavailableCount > 0 && <span className="flex items-center gap-1 text-red-600"><XCircle size={14} /> {unavailableCount} Agot.</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </motion.div>

            {/* Barra de Búsqueda */}
            <motion.div variants={itemVariants} className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A65F33]/50" />
              <Input
                placeholder="Buscar por nombre de plato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base border-[#FFE0C2] bg-white text-[#A65F33] focus:border-[#FFA142] focus:ring-[#FFA142]/50"
              />
            </motion.div>

            {/* Tabla de Platos */}
            <motion.div variants={itemVariants} className="rounded-xl border border-[#FFE0C2] bg-white shadow-sm overflow-hidden">
              <Table className="border-separate border-spacing-0">
                <TableHeader className="bg-[#FFF3E5]">
                  <TableRow>
                    {/* ✅ CAMBIO: La cabecera ahora solo tiene 4 columnas */}
                    <TableHead className="w-[300px] text-[#A65F33] font-semibold">Nombre</TableHead>
                    <TableHead className="text-[#A65F33] font-semibold">Categoría</TableHead>
                    <TableHead className="text-[#A65F33] font-semibold">Precio</TableHead>
                    {/* ✅ CAMBIO: La última columna ahora agrupa todo */}
                    <TableHead className="text-right text-[#A65F33] font-semibold w-[280px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredMenuItems.length > 0 ? (
                      filteredMenuItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          whileTap={{ scale: 0.99 }}
                          className={cn("hover:bg-[#FFF5ED]/60", index % 2 !== 0 && "bg-[#FFF5ED]/40")}
                        >
                          <TableCell className="font-semibold text-[#A65F33]">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3E5] border border-[#FFE0C2] shrink-0">
                                {categoryIcons[item.category]}
                              </div>
                              <span>{item.name}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="inline-flex items-center rounded-full border border-[#FFE0C2] bg-[#FFF3E5] px-2.5 py-0.5 text-xs font-semibold text-[#A65F33]">
                              {item.category}
                            </div>
                          </TableCell>

                          <TableCell className="font-semibold text-[#FFA142]">S/ {item.price.toFixed(2)}</TableCell>

                          {/* ✅ CAMBIO PRINCIPAL: Nueva celda de acciones unificada */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-4">
                              {/* Grupo de Disponibilidad */}
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={item.available}
                                  onCheckedChange={() => toggleMenuItemAvailability(item.id)}
                                />
                                <span className={cn(
                                  "text-sm font-semibold w-20", // Ancho fijo para evitar saltos de layout
                                  item.available ? "text-green-600" : "text-red-600"
                                )}>
                                  {item.available ? "Disponible" : "Agotado"}
                                </span>
                              </div>

                              {/* Separador Visual */}
                              <div className="h-6 w-px bg-[#FFE0C2]" />

                              {/* Botones de Acción */}
                              <div>
                                <Button variant="ghost" size="icon" onClick={() => handleEditDish(item)} className="rounded-full hover:bg-[#FFA142]/10"><Edit2 className="h-5 w-5 text-[#FFA142]" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setDishToDelete(item)} className="rounded-full hover:bg-red-500/10"><Trash2 className="h-5 w-5 text-red-500" /></Button>
                              </div>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center"> {/* Colspan ajustado a 4 */}
                          <div className="flex flex-col items-center justify-center gap-4">
                            <SearchX size={48} className="text-[#A65F33]/30" />
                            <p className="text-lg font-semibold text-[#A65F33]">No se encontraron platos</p>
                            <p className="text-sm text-[#A65F33]/70">Intenta ajustar tu búsqueda o filtro de categoría.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* Modales */}
      <DishFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmitDish} dish={editingDish} />

      <AlertDialog open={dishToDelete !== null} onOpenChange={() => setDishToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este plato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente y no se puede deshacer. Se eliminará "{dishToDelete?.name}" del menú.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Sí, eliminar plato
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}