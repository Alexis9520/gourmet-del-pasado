"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Trash2 } from "lucide-react"
import { usePOSStore } from "@/lib/store"
import type { Table } from "@/lib/store"
import { OrderModal } from "@/components/order-modal"

// Tipos de estado de silla
type SeatStatus = "available" | "occupied"

// Tipo de sede
type SedeType = "restaurante" | "polleria"

// Tipo de mesa
interface TableData {
  id: string
  number: number
  seats: SeatStatus[]
  onClick?: () => void
  onDelete?: () => void
}

// Configuración de sedes
interface SedeConfig {
  name: string
  tables: TableData[]
}

// Paleta de colores naranja/terracota (La Posada)
const colors = {
  tableSurface: "#FEF3E2", // Beige/crema claro
  available: "#F5D5B8", // Beige/naranja claro para disponible
  occupied: "#D87A4F", // Naranja/terracota para ocupado
  border: "#E8A87C", // Borde naranja suave
  text: "#B85C34", // Texto naranja oscuro/terracota
  background: "#FDF8F3", // Fondo beige muy claro
}

// Componente individual de silla con controles
function Seat({ 
  status, 
  position, 
  onRemove, 
  showControls = false,
  style,
}: { 
  status: SeatStatus
  position: string
  onRemove?: () => void
  showControls?: boolean
  style?: React.CSSProperties
}) {
  const seatColor = status === "available" ? colors.available : colors.occupied
  
  return (
    <div className="relative" style={style}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={cn(
          "rounded-lg shadow-md transition-all relative",
          position === "top" || position === "bottom" ? "w-12 h-8" : "w-8 h-12"
        )}
        style={{ backgroundColor: seatColor }}
      >
        {showControls && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        )}
      </motion.div>
    </div>
  )
}

// Componente de mesa individual con sillas editables
function TableWithSeats({ 
  table, 
  onUpdateSeats,
  editMode = false
}: { 
  table: TableData
  onUpdateSeats?: (tableId: string, seats: SeatStatus[]) => void
  editMode?: boolean
}) {
  const seats = table.seats
  
  const removeSeat = (index: number) => {
    if (onUpdateSeats && seats.length > 1) {
      const newSeats = seats.filter((_, i) => i !== index)
      onUpdateSeats(table.id, newSeats)
    }
  }
  
  const addSeat = () => {
    const maxSeats = 8
    if (onUpdateSeats && seats.length < maxSeats) {
      const newSeats = [...seats, "available" as SeatStatus]
      onUpdateSeats(table.id, newSeats)
    }
  }
  
  // Distribuir sillas alrededor de la mesa
  // Por defecto: 2 arriba, 2 abajo. Las adicionales van a los lados
  let topSeats: SeatStatus[] = []
  let bottomSeats: SeatStatus[] = []
  let leftSeats: SeatStatus[] = []
  let rightSeats: SeatStatus[] = []
  
  if (seats.length <= 4) {
    // 4 o menos sillas: 2 arriba, resto abajo
    topSeats = seats.slice(0, 2)
    bottomSeats = seats.slice(2)
  } else {
    // Más de 4 sillas: 2 arriba, 2 abajo, resto en los lados
    topSeats = seats.slice(0, 2)
    bottomSeats = seats.slice(2, 4)
    const sideSeats = seats.slice(4)
    leftSeats = sideSeats.filter((_, idx) => idx % 2 === 0)
    rightSeats = sideSeats.filter((_, idx) => idx % 2 === 1)
  }
  
  const handleClick = (e: React.MouseEvent) => {
    if (!editMode && table.onClick) {
      table.onClick()
    }
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative cursor-pointer w-[160px] sm:w-[200px] h-[180px]"
    >
      {editMode && table.onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); if (window.confirm(`Eliminar mesa ${table.number}?`)) table.onDelete && table.onDelete() }}
          className="absolute -top-2 -right-2 z-20 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-600"
          title="Eliminar mesa"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      {/* Sillas superiores */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-2">
        {topSeats.map((status, idx) => (
          <Seat 
            key={`top-${idx}`} 
            status={status} 
            position="top"
            onRemove={() => removeSeat(idx)}
            showControls={editMode}
          />
        ))}
      </div>
      
      {/* Sillas izquierdas (ligeramente hacia afuera) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-2" style={{ left: '-8px' }}>
        {leftSeats.map((status, idx) => (
          <Seat 
            key={`left-${idx}`} 
            status={status} 
            position="left"
            onRemove={() => removeSeat(4 + idx * 2)}
            showControls={editMode}
          />
        ))}
      </div>
      
      {/* Superficie de la mesa (centro) */}
      <motion.div
        whileHover={{ boxShadow: "0 10px 30px rgba(216, 122, 79, 0.2)" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-lg flex flex-col items-center justify-center"
        style={{
          width: "140px",
          height: "100px",
          backgroundColor: colors.tableSurface,
          border: `3px solid ${colors.border}`,
        }}
      >
        <span className="text-4xl font-bold" style={{ color: colors.text }}>
          {table.number}
        </span>
        {editMode && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              addSeat()
            }}
            disabled={seats.length >= 8}
            className={`mt-1 text-xs px-2 py-1 rounded ${seats.length >= 8 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
          >
            {seats.length >= 8 ? '+ Máx' : '+ Silla'}
          </button>
        )}
      </motion.div>
      
      {/* Sillas derechas (ligeramente hacia afuera) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2" style={{ right: '-8px' }}>
        {rightSeats.map((status, idx) => (
          <Seat 
            key={`right-${idx}`} 
            status={status} 
            position="right"
            onRemove={() => removeSeat(4 + idx * 2 + 1)}
            showControls={editMode}
          />
        ))}
      </div>
      
      {/* Sillas inferiores */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {bottomSeats.map((status, idx) => (
          <Seat 
            key={`bottom-${idx}`} 
            status={status} 
            position="bottom"
            onRemove={() => removeSeat(2 + idx)}
            showControls={editMode}
          />
        ))}
      </div>
    </motion.div>
  )
}

// Leyenda de estados
function Legend() {
  return (
    <div className="flex flex-wrap gap-6 mb-8 justify-center">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-6 rounded-lg shadow-sm"
          style={{ backgroundColor: colors.available }}
        />
        <span className="text-sm font-semibold" style={{ color: colors.text }}>
          Disponible
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-6 rounded-lg shadow-sm"
          style={{ backgroundColor: colors.occupied }}
        />
        <span className="text-sm font-semibold" style={{ color: colors.text }}>
          Ocupado
        </span>
      </div>
    </div>
  )
}

// Componente principal de cuadrícula
interface RestaurantTableGridProps {
  tables: TableData[]
}

export function RestaurantTableGrid({ tables: initialTables }: RestaurantTableGridProps) {
  const [currentSede, setCurrentSede] = useState<SedeType>("restaurante")
  const [editMode, setEditMode] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  const storeTables = usePOSStore(state => state.tables)
  const addNotification = usePOSStore(state => state.addNotification)
  
  // Configuración inicial de sedes (4 sillas por defecto: 2 arriba, 2 abajo)
  const [sedes, setSedes] = useState<Record<SedeType, TableData[]>>({
    restaurante: [
      { id: "r1", number: 1, seats: Array(4).fill("available") },
      { id: "r2", number: 2, seats: Array(4).fill("available") },
      { id: "r3", number: 3, seats: Array(4).fill("available") },
      { id: "r4", number: 4, seats: Array(4).fill("available") },
      { id: "r5", number: 5, seats: Array(4).fill("available") },
      { id: "r6", number: 6, seats: Array(4).fill("available") },
      { id: "r7", number: 7, seats: Array(4).fill("available") },
      { id: "r8", number: 8, seats: Array(4).fill("available") },
      { id: "r9", number: 9, seats: Array(4).fill("available") },
      { id: "r10", number: 10, seats: Array(4).fill("available") },
    ],
    polleria: [
      { id: "p1", number: 1, seats: Array(4).fill("available") },
      { id: "p2", number: 2, seats: Array(4).fill("available") },
      { id: "p3", number: 3, seats: Array(4).fill("available") },
      { id: "p4", number: 4, seats: Array(4).fill("available") },
      { id: "p5", number: 5, seats: Array(4).fill("available") },
      { id: "p6", number: 6, seats: Array(4).fill("available") },
      { id: "p7", number: 7, seats: Array(4).fill("available") },
      { id: "p8", number: 8, seats: Array(4).fill("available") },
      { id: "p9", number: 9, seats: Array(4).fill("available") },
      { id: "p10", number: 10, seats: Array(4).fill("available") },
    ],
  })
  
  const currentTables = sedes[currentSede]
  
  const handleUpdateSeats = (tableId: string, newSeats: SeatStatus[]) => {
    setSedes(prev => ({
      ...prev,
      [currentSede]: prev[currentSede].map(table => 
        table.id === tableId ? { ...table, seats: newSeats } : table
      )
    }))
    // Notify user
    addNotification({ type: 'success', message: `Sillas de la mesa actualizadas (${newSeats.length})` })
  }

  const openTableModal = (tableNumber: number) => {
    const storeTable = storeTables.find(t => t.number === tableNumber)
    if (storeTable) {
      setSelectedTable(storeTable)
    } else {
      // Fallback minimal Table object if not found in store
      setSelectedTable({ id: `table-${tableNumber}`, number: tableNumber, status: 'libre', orders: [], total: 0, x: 0, y: 0, seats: 4 })
    }
  }

  const deleteTable = (tableId: string) => {
    setSedes(prev => ({
      ...prev,
      [currentSede]: prev[currentSede].filter(t => t.id !== tableId)
    }))
    addNotification({ type: 'info', message: `Mesa eliminada en ${currentSede}` })
  }
  
  return (
    <div className="p-8 bg-[#FDF8F3]">
      {/* Header con controles */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          {/* Título */}
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: colors.text }}
          >
            Mapa de Mesas - {currentSede === "restaurante" ? "Restaurante" : "Pollería"}
          </h2>
          
          {/* Controles */}
          <div className="flex gap-2">
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "default" : "outline"}
              style={{
                backgroundColor: editMode ? colors.occupied : "transparent",
                borderColor: colors.border,
                color: editMode ? "white" : colors.text,
              }}
            >
              {editMode ? "Modo Vista" : "Modo Edición"}
            </Button>
            <Button
              onClick={() => {
                // Añadir mesa en la sede actual
                const addTable = () => {
                  setSedes(prev => {
                    const current = prev[currentSede] || []
                    const maxNumber = current.reduce((max, t) => Math.max(max, t.number), 0)
                    const newNumber = maxNumber + 1
                    const prefix = currentSede === 'restaurante' ? 'r' : 'p'
                    const newTable: TableData = { id: `${prefix}${newNumber}`, number: newNumber, seats: Array(4).fill('available') }
                    addNotification({ type: 'success', message: `Mesa ${newNumber} creada en ${currentSede}` })
                    return { ...prev, [currentSede]: [...current, newTable] }
                  })
                }
                addTable()
              }}
              variant="outline"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              Agregar Mesa
            </Button>
          </div>
        </div>
        
        {/* Selector de sedes */}
        <div className="flex gap-2 justify-center mb-4">
          <Button
            onClick={() => setCurrentSede("restaurante")}
            variant={currentSede === "restaurante" ? "default" : "outline"}
            style={{
              backgroundColor: currentSede === "restaurante" ? colors.occupied : "transparent",
              borderColor: colors.border,
              color: currentSede === "restaurante" ? "white" : colors.text,
            }}
          >
            Restaurante
          </Button>
          <Button
            onClick={() => setCurrentSede("polleria")}
            variant={currentSede === "polleria" ? "default" : "outline"}
            style={{
              backgroundColor: currentSede === "polleria" ? colors.occupied : "transparent",
              borderColor: colors.border,
              color: currentSede === "polleria" ? "white" : colors.text,
            }}
          >
            Pollería
          </Button>
        </div>
      </div>
      
      {/* Leyenda */}
      <Legend />
      
      {/* Cuadrícula de mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center max-w-7xl mx-auto">
        {currentTables.map((table) => (
          <TableWithSeats 
            key={table.id} 
            table={{ ...table, onClick: () => openTableModal(table.number), onDelete: () => deleteTable(table.id) }}
            onUpdateSeats={handleUpdateSeats}
            editMode={editMode}
          />
        ))}
      </div>

      {selectedTable && (
        <OrderModal
          table={selectedTable}
          onClose={() => {
            // Al cerrar el modal, sincronizar estado local de sedes con el store: si la mesa tiene pedidos, marcar sillas como ocupadas
            const storeTable = storeTables.find(t => t.id === selectedTable.id)
            if (storeTable && storeTable.orders && storeTable.orders.length > 0) {
              setSedes(prev => ({
                ...prev,
                [currentSede]: prev[currentSede].map(t =>
                  t.number === storeTable.number ? { ...t, seats: Array(Math.min(8, storeTable.seats || t.seats.length)).fill("occupied") as SeatStatus[] } : t
                )
              }))
            }
            setSelectedTable(null)
          }}
        />
      )}
    </div>
  )
}
