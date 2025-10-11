"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MenuItem } from "@/lib/store"

interface DishFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (dish: Omit<MenuItem, "id">) => void
  dish?: MenuItem
}

export function DishFormModal({ open, onClose, onSubmit, dish }: DishFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Entradas",
    price: "",
    available: true,
  })

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name,
        category: dish.category,
        price: dish.price.toString(),
        available: dish.available,
      })
    } else {
      setFormData({
        name: "",
        category: "Entradas",
        price: "",
        available: true,
      })
    }
  }, [dish, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      category: formData.category,
      price: Number.parseFloat(formData.price),
      available: formData.available,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{dish ? "Editar Plato" : "Añadir Nuevo Plato"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Plato</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Ceviche Clásico"
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="rounded-xl">
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
            <Label htmlFor="price">Precio (S/)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
              className="rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90">
              {dish ? "Guardar Cambios" : "Añadir Plato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
