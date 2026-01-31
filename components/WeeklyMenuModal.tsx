"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { usePOSStore } from "@/lib/store"
import type { MenuItem } from "@/lib/store"
import { X, Search, Plus, Trash2 } from "lucide-react"

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

interface WeeklyMenuModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WeeklyMenuModal({ isOpen, onClose }: WeeklyMenuModalProps) {
  const menuItems = usePOSStore(s => s.menuItems)
  const addMenu = usePOSStore(s => s.addMenu)
  const addNotification = usePOSStore(s => s.addNotification)

  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [query, setQuery] = useState("")
  const [menuName, setMenuName] = useState("")

  // local structure: Record<dayIndex, menuItemIds[]>
  const [weeklySelection, setWeeklySelection] = useState<Record<number, string[]>>(() => {
    const init: Record<number, string[]> = {}
    days.forEach((_, i) => (init[i] = []))
    return init
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return menuItems
    return menuItems.filter(mi => mi.name.toLowerCase().includes(q) || mi.category.toLowerCase().includes(q))
  }, [query, menuItems])

  const addToDay = (dayIndex: number, item: MenuItem) => {
    setWeeklySelection(prev => {
      const next = { ...prev }
      if (!next[dayIndex]) next[dayIndex] = []
      if (!next[dayIndex].includes(item.id)) next[dayIndex] = [...next[dayIndex], item.id]
      return next
    })
  }

  const removeFromDay = (dayIndex: number, itemId: string) => {
    setWeeklySelection(prev => ({ ...prev, [dayIndex]: prev[dayIndex].filter(id => id !== itemId) }))
  }

  const handleCreateWeeklyMenu = () => {
    if (!menuName.trim()) {
      addNotification({ type: 'warning', message: 'Ingrese un nombre para el menú semanal' })
      return
    }

    const menu = {
      name: menuName,
      isActive: false,
      items: [],
      weeklyItems: Object.fromEntries(Object.keys(weeklySelection).map(k => [k as any, weeklySelection[Number(k)]])),
      type: 'weekly' as const
    }

    addMenu(menu)
    addNotification({ type: 'success', message: `Menú semanal "${menuName}" creado` })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="w-full max-w-7xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex"
      >
        {/* Left: Days grid */}
        <div className="w-3/5 border-r border-[#F1E6DE] p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#A65F33]">Crear Menú Semanal</h2>
            <div className="flex items-center gap-2">
              <Input placeholder="Nombre del menú" value={menuName} onChange={(e) => setMenuName(e.target.value)} className="w-72" />
              <Button variant="ghost" onClick={onClose} className="text-[#A65F33]">
                <X />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {days.map((d, idx) => (
              <div key={d} className={cn("p-3 rounded-lg border bg-[#FFF6F0]", selectedDayIndex === idx ? 'ring-2 ring-orange-300' : '')}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-[#A65F33]">{d}</h3>
                  <button className="text-xs text-[#A65F33]/60" onClick={() => setSelectedDayIndex(idx)}>Editar</button>
                </div>
                <div className="space-y-2 max-h-[18vh] overflow-auto">
                  {weeklySelection[idx].length === 0 ? (
                    <p className="text-xs text-[#A65F33]/50">Sin platos</p>
                  ) : (
                    weeklySelection[idx].map(id => {
                      const mi = menuItems.find(m => m.id === id)
                      if (!mi) return null
                      return (
                        <div key={id} className="flex items-center justify-between gap-2 bg-white p-2 rounded shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-[#FFF3E5] flex items-center justify-center text-sm text-[#A65F33]">🍽️</div>
                            <div className="text-sm font-medium text-[#A65F33]">{mi.name}</div>
                          </div>
                          <button onClick={() => removeFromDay(idx, id)} className="text-red-500"><Trash2 /></button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleCreateWeeklyMenu} className="bg-[#FFA142] text-white">Crear Menú Semanal</Button>
          </div>
        </div>

        {/* Right: Catalog */}
        <div className="w-2/5 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A65F33]/60" />
              <Input placeholder="Buscar platos..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="w-36">
              <div className="text-xs text-[#A65F33]/70">Día actual</div>
              <div className="font-semibold text-[#A65F33]">{days[selectedDayIndex]}</div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 gap-3">
              {filtered.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-white shadow-sm hover:shadow-md cursor-pointer" onClick={() => addToDay(selectedDayIndex, item)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-[#FFF3E5] flex items-center justify-center text-sm">🍽️</div>
                    <div>
                      <div className="font-semibold text-[#A65F33]">{item.name}</div>
                      <div className="text-xs text-[#A65F33]/60">S/ {item.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-[#A65F33]/70">{item.category}</div>
                    <Plus className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
