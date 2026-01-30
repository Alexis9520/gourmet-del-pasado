"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import type { MenuItem, Site } from "@/lib/store"
import { UtensilsCrossed, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react"
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
    image: "",
    available: true,
    sites: ["polleria", "restaurante"] as Site[],
  }
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ name?: string; price?: string; sites?: string }>({});

  useEffect(() => {
    if (open) {
      if (dish) {
        setFormData({
          name: dish.name,
          category: dish.category,
          price: dish.price.toString(),
          image: dish.image || "",
          available: dish.available,
          sites: dish.sites || ["polleria"],
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [dish, open]);

  const validate = () => {
    const newErrors: { name?: string; price?: string; sites?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "El nombre del plato es requerido.";
    }
    const priceNumber = Number.parseFloat(formData.price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      newErrors.price = "El precio debe ser un número positivo.";
    }
    if (formData.sites.length === 0) {
      newErrors.sites = "Debes seleccionar al menos una sede.";
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
        image: formData.image,
        available: formData.available,
        sites: formData.sites,
      });
      onClose();
    }
  };

  const toggleSite = (site: Site) => {
    setFormData(prev => {
      const currentSites = prev.sites;
      if (currentSites.includes(site)) {
        return { ...prev, sites: currentSites.filter(s => s !== site) };
      } else {
        return { ...prev, sites: [...currentSites, site] };
      }
    })
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  } as const;

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="p-0 border-[#FFE0C2] bg-white max-w-2xl shadow-2xl overflow-hidden">
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

              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#A65F33] font-semibold">Nombre del Plato</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Ceviche Clásico"
                      className="border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33] focus:border-[#FFA142]"
                    />
                    {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[#A65F33] font-semibold">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entradas">Entradas</SelectItem>
                        <SelectItem value="Fondos">Fondos</SelectItem>
                        <SelectItem value="Pollos a la brasa">Pollos a la brasa</SelectItem>
                        <SelectItem value="Parrillas">Parrillas</SelectItem>
                        <SelectItem value="Chaufas">Chaufas</SelectItem>
                        <SelectItem value="Segundos">Segundos</SelectItem>
                        <SelectItem value="Sopas">Sopas</SelectItem>
                        <SelectItem value="Bebidas">Bebidas</SelectItem>
                        <SelectItem value="Gaseosas">Gaseosas</SelectItem>
                        <SelectItem value="Licores">Licores</SelectItem>
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
                        className="pl-9 border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33]"
                      />
                    </div>
                    {errors.price && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.price}</p>}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-[#A65F33] font-semibold">URL de Imagen</Label>
                    <div className="relative">
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://..."
                        className="pl-9 border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33]"
                      />
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A65F33]/40" />
                    </div>

                    {/* Image Preview */}
                    <div className="mt-2 h-32 w-full rounded-lg border-2 border-dashed border-[#FFE0C2] bg-[#FFF5ED] flex items-center justify-center overflow-hidden relative group">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="h-8 w-8 text-[#FFE0C2] mx-auto mb-1" />
                          <span className="text-xs text-[#A65F33]/40">Vista previa</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[#A65F33] font-semibold">Sedes Disponibles</Label>
                    <div className="flex flex-col gap-2 p-3 bg-[#F4EFDF] rounded-lg border border-[#FFE0C2]">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="site-polleria"
                          checked={formData.sites.includes("polleria")}
                          onCheckedChange={() => toggleSite("polleria")}
                        />
                        <Label htmlFor="site-polleria" className="cursor-pointer">Pollería</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="site-restaurante"
                          checked={formData.sites.includes("restaurante")}
                          onCheckedChange={() => toggleSite("restaurante")}
                        />
                        <Label htmlFor="site-restaurante" className="cursor-pointer">Restaurante</Label>
                      </div>
                    </div>
                    {errors.sites && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.sites}</p>}
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#F4EFDF] p-3 border border-[#FFE0C2]">
                    <Label htmlFor="available" className="text-[#A65F33] font-semibold text-sm">
                      Disponible para venta
                    </Label>
                    <Switch
                      id="available"
                      checked={formData.available}
                      onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                    />
                  </div>
                </div>

                <DialogFooter className="md:col-span-2 gap-2 pt-4 border-t border-[#FFE0C2]">
                  <Button type="button" variant="outline" onClick={onClose} className="border-[#FFE0C2] bg-transparent text-[#A65F33] hover:bg-[#FFF3E5]">
                    Cancelar
                  </Button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 py-2 bg-[#FFA142] text-white shadow-lg shadow-orange-300/60 hover:bg-[#FFB167] transition-all"
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
