"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch" // Importa el nuevo componente
import type { MenuItem } from "@/lib/store"
import { UtensilsCrossed, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DishFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (dish: Omit<MenuItem, "id">) => void
  dish?: MenuItem
}

export function DishFormModal({ open, onClose, onSubmit, dish }: DishFormModalProps) {
  const initialFormState = {
    name: "",
    category: "Entradas",
    price: "",
    available: true,
  }
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  useEffect(() => {
    if (open) {
      if (dish) {
        setFormData({
          name: dish.name,
          category: dish.category,
          price: dish.price.toString(),
          available: dish.available,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({}); // Limpia errores al abrir
    }
  }, [dish, open]);

  const validate = () => {
    const newErrors: { name?: string; price?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "El nombre del plato es requerido.";
    }
    const priceNumber = Number.parseFloat(formData.price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      newErrors.price = "El precio debe ser un número positivo.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        available: formData.available,
      });
      onClose();
    }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  } as const;

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="p-0 border-[#FFE0C2] bg-white max-w-lg shadow-2xl">
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              <DialogHeader className="bg-[#FFF5ED] p-6 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFA142]/10">
                    <UtensilsCrossed className="h-7 w-7 text-[#FFA142]" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-[#A65F33]">{dish ? "Editar Plato" : "Añadir Nuevo Plato"}</DialogTitle>
                    <p className="text-sm text-[#A65F33]/70">Rellena los detalles del producto.</p>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#A65F33] font-semibold">Nombre del Plato</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Ceviche Clásico"
                    className="border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33] focus:border-[#FFA142] focus:ring-[#FFA142]/50"
                  />
                  {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14}/> {errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[#A65F33] font-semibold">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33] focus:ring-[#FFA142]/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entradas">Entradas</SelectItem>
                        <SelectItem value="Fondos">Fondos</SelectItem>
                        <SelectItem value="Bebidas">Bebidas</SelectItem>
                        <SelectItem value="Postres">Postres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-[#A65F33] font-semibold">Precio</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A65F33]/60 font-semibold">S/</span>
                      <Input
                        id="price" type="number" step="0.01" value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        className="pl-9 border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33] focus:border-[#FFA142] focus:ring-[#FFA142]/50"
                      />
                    </div>
                    {errors.price && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14}/> {errors.price}</p>}
                  </div>
                </div>
                
                <div className="flex items-center justify-between rounded-lg bg-[#F4EFDF] p-4 border border-[#FFE0C2]">
                    <Label htmlFor="available" className="text-[#A65F33] font-semibold flex flex-col">
                        Disponibilidad
                        <span className="text-xs font-normal text-[#A65F33]/70">Actívalo si el plato está disponible para la venta.</span>
                    </Label>
                    <Switch
                        id="available"
                        checked={formData.available}
                        onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                    />
                </div>

                <DialogFooter className="gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="border-[#FFE0C2] bg-transparent text-[#A65F33] hover:bg-[#FFF3E5]">
                    Cancelar
                  </Button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-[#FFA142] text-white shadow-lg shadow-orange-300/60 hover:bg-[#FFB167]"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {dish ? "Guardar Cambios" : "Añadir Plato"}
                  </motion.button>
                </DialogFooter>
              </form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}