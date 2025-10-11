"use client"

import { useState, useEffect } from "react"
import { Check, Clock } from "lucide-react"
import type { KitchenTicket } from "@/lib/store"
import { usePOSStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface KitchenTicketCardProps {
  ticket: KitchenTicket
}

export function KitchenTicketCard({ ticket }: KitchenTicketCardProps) {
  const { markTicketReady } = usePOSStore()
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - ticket.startTime.getTime()) / 1000 / 60)
      setElapsedMinutes(diff)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [ticket.startTime])

  const getTimerColor = () => {
    if (elapsedMinutes <= 5) return "text-success"
    if (elapsedMinutes <= 10) return "text-warning"
    return "text-destructive"
  }

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId)
    } else {
      newChecked.add(itemId)
    }
    setCheckedItems(newChecked)
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-700 bg-[#2a2a2a] shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-700 bg-[#1f1f1f] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold">Mesa {ticket.tableNumber}</h3>
            <p className="text-sm text-gray-400">{ticket.waiter}</p>
          </div>
          <div className={cn("flex items-center gap-2 font-mono text-2xl font-bold", getTimerColor())}>
            <Clock className="h-6 w-6" />
            <span>{elapsedMinutes} min</span>
          </div>
        </div>
      </div>
      {/*Notas*/}
      {ticket.notes && (
        <div className="border-b border-gray-700 bg-yellow-900/30 p-3">
          <p className="text-sm text-yellow-300">
            <span className="font-bold">NOTA GENERAL:</span> {ticket.notes}
          </p>
        </div>
      )}
      {/* Items */}
      <div className="flex-1 space-y-3 p-4">
        {ticket.items.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={checkedItems.has(item.id)}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-1 border-gray-500"
              />
              <label
                htmlFor={item.id}
                className={cn(
                  "flex-1 cursor-pointer text-base font-semibold",
                  checkedItems.has(item.id) && "text-gray-500 line-through",
                )}
              >
                <span className="mr-2 text-primary">x{item.quantity}</span>
                {item.name}
              </label>
            </div>
            {item.notes && (
              <p className="ml-8 text-sm text-warning">
                <span className="font-semibold">Nota:</span> {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 p-4">
        <Button
          onClick={() => markTicketReady(ticket.id)}
          className="w-full bg-success text-success-foreground hover:bg-success/90"
          size="lg"
        >
          <Check className="mr-2 h-5 w-5" />
          Pedido Listo
        </Button>
      </div>
    </div>
  )
}
