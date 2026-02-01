"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X, Users, Clock, Receipt, ChefHat, Printer, Plus, Minus, Armchair, UtensilsCrossed } from "lucide-react";
import { FloorPlanObject, TableStatus, STATUS_COLORS, STATUS_LABELS } from "../types/floorplan";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TablePopupProps {
  table: FloorPlanObject;
  position: { x: number; y: number };
  onClose: () => void;
  onStatusChange: (status: TableStatus) => void;
  onAddChairs: (count: number) => void;
  onPrintBill: () => void;
  onAddOrder: () => void;
}

// Mock data for demo
const MOCK_ORDERS: Record<string, { items: string[]; total: number; server: string; time: string }> = {
  "occupied": {
    items: ["Lomo Saltado x2", "Chicha Morada x2", "Arroz Chaufa x1"],
    total: 142.50,
    server: "María G.",
    time: "1h 15m",
  },
  "paying": {
    items: ["Pollo a la Brasa x1", "Papas Fritas x1", "Coca Cola 1.5L x1"],
    total: 68.00,
    server: "Carlos R.",
    time: "45m",
  },
};

export function TablePopup({
  table,
  position,
  onClose,
  onStatusChange,
  onAddChairs,
  onPrintBill,
  onAddOrder,
}: TablePopupProps) {
  const status = table.status || "available";
  const colors = STATUS_COLORS[status];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".table-popup")) {
        onClose();
      }
    };
    setTimeout(() => {
      window.addEventListener("click", handleClickOutside);
    }, 100);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  const order = MOCK_ORDERS[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="table-popup absolute z-50"
      style={{
        left: Math.min(position.x, window.innerWidth - 340),
        top: position.y,
      }}
    >
      <Card className="w-80 border-[#FFE0C2] shadow-xl overflow-hidden">
        {/* Header */}
        <CardHeader className={cn("p-4 pb-3", colors.bg)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-white",
                colors.text
              )}>
                {table.label}
              </div>
              <div>
                <h3 className="font-bold text-[#A65F33]">{table.label || "Mesa"}</h3>
                <Badge variant="secondary" className={cn("text-xs", colors.bg, colors.text)}>
                  {STATUS_LABELS[status].toUpperCase()}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#A65F33]/60 hover:text-[#A65F33] hover:bg-white/50"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Capacity control */}
          <div className="flex items-center justify-between pb-3 border-b border-[#FFE0C2]">
            <div className="flex items-center gap-2 text-[#A65F33]">
              <Armchair className="w-4 h-4" />
              <span className="text-sm">Capacidad</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-[#FFE0C2] text-[#A65F33]"
                onClick={() => onAddChairs(Math.max(0, (table.capacity || 0) - 1))}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center font-semibold text-[#A65F33]">{table.capacity || 0}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-[#FFE0C2] text-[#A65F33]"
                onClick={() => onAddChairs((table.capacity || 0) + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Order info */}
          {order && (
            <div className="space-y-3 pb-3 border-b border-[#FFE0C2]">
              <div className="flex items-center gap-2 text-[#A65F33]">
                <UtensilsCrossed className="w-4 h-4" />
                <span className="text-sm">Mesero: <span className="font-medium">{order.server}</span></span>
              </div>
              <div className="flex items-center gap-2 text-[#A65F33]">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Tiempo: <span className="font-medium">{order.time}</span></span>
              </div>
              
              <div className="bg-[#FFF5ED] rounded-lg p-3">
                <p className="text-xs font-medium text-[#A65F33]/60 mb-2">PEDIDO</p>
                <ul className="space-y-1">
                  {order.items.map((item, i) => (
                    <li key={i} className="text-sm text-[#A65F33]">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#A65F33]/60">Total</span>
                <span className="text-xl font-bold text-[#FFA142]">S/ {order.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Status changer */}
          <div>
            <p className="text-xs font-medium text-[#A65F33]/40 uppercase mb-2">Cambiar Estado</p>
            <div className="grid grid-cols-5 gap-1">
              {(["available", "occupied", "reserved", "paying", "cleaning"] as TableStatus[]).map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(s);
                  }}
                  className={cn(
                    "h-8 px-1 text-[10px] border-[#FFE0C2]",
                    status === s 
                      ? cn(STATUS_COLORS[s].bg, STATUS_COLORS[s].text, "border-current ring-1 ring-current") 
                      : "text-[#A65F33]/60 hover:text-[#A65F33] hover:bg-[#FFF5ED]"
                  )}
                >
                  {s === "available" && "Disp"}
                  {s === "occupied" && "Ocup"}
                  {s === "reserved" && "Resv"}
                  {s === "paying" && "Pago"}
                  {s === "cleaning" && "Limp"}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-1 border-[#FFE0C2] text-[#A65F33] hover:bg-[#FFF5ED]"
              onClick={onPrintBill}
              disabled={status !== "occupied" && status !== "paying"}
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
            <Button
              className="flex-1 gap-1 bg-[#FFA142] hover:bg-[#FFA142]/90 text-white"
              onClick={onAddOrder}
              disabled={status === "paying" || status === "cleaning"}
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
