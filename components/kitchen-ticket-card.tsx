"use client"

import { useMemo } from "react"
import { usePOSStore, OrderItem, OrderItemStatus } from "@/lib/store"
import { Clock, User, CheckCircle2, CookingPot, Loader2, AlertTriangle, Store, ShoppingBag, Bike } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import TimeAgo from 'react-timeago'
// @ts-ignore
import esStrings from 'react-timeago/lib/language-strings/es'
// @ts-ignore
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'
import { motion, AnimatePresence } from "framer-motion"


const formatter = buildFormatter(esStrings)

interface KitchenComanda {
  tableId: string;
  tableNumber: number;
  waiter: string;
  startTime: Date;
  items: OrderItem[];
}

export function KitchenTicketCard({ comanda }: { comanda: KitchenComanda }) {
  const { updateOrderItemStatus } = usePOSStore()

  // Filtramos los items que aún están en la cocina (no servidos o cancelados)
  const activeItems = useMemo(() =>
    comanda.items.filter(item => item.status === 'pendiente' || item.status === 'en preparación'),
    [comanda.items]
  );

  // Verificamos si toda la comanda está lista para ser marcada como completada
  const isComandaReady = useMemo(() => activeItems.length === 0 && comanda.items.length > 0, [activeItems.length, comanda.items.length]);

  const handleUpdateStatus = (itemId: string, newStatus: OrderItemStatus) => {
    updateOrderItemStatus(comanda.tableId, itemId, newStatus);
  };

  const statusConfig = {
    pendiente: {
      icon: Loader2,
      color: "text-[#A65F33]", // Marrón Oscuro
      label: "En Cola",
      nextAction: {
        status: 'en preparación' as OrderItemStatus,
        label: "Empezar a Preparar",
        variant: "outline" as const,
        className: "border-[#A65F33] text-[#A65F33] hover:bg-[#FFE0C2] hover:text-[#A65F33]"
      }
    },
    'en preparación': {
      icon: CookingPot,
      color: "text-[#FFA142]", // Naranja Principal
      label: "Cocinando",
      nextAction: {
        status: 'listo' as OrderItemStatus,
        label: "¡Plato Listo!",
        variant: "default" as const,
        className: "bg-[#FFA142] text-white shadow-lg hover:bg-[#FFB167]"
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "flex h-full flex-col rounded-xl shadow-lg border",
        isComandaReady ? "border-green-400 bg-green-50" : "border-[#FFE0C2] bg-[#FFF3E5]" // Durazno Pálido y Crema Suave
      )}
    >
      {/* Encabezado de la comanda */}
      <div className="p-4 border-b-2 border-dashed border-[#FFE0C2]">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-3xl font-extrabold text-[#A65F33]">Mesa {comanda.tableNumber}</h3>
          <span className="text-sm font-semibold text-[#A65F33]/80">
            <TimeAgo date={comanda.startTime} formatter={formatter} />
          </span>
        </div>
        <p className="text-sm text-[#A65F33]/90 flex items-center gap-1.5"><User size={14} /> {comanda.waiter}</p>
      </div>

      {/* Lista de items con animación */}
      <div className="flex-1 space-y-1 p-2 overflow-y-auto">
        <AnimatePresence>
          {activeItems.map(item => {
            const config = statusConfig[item.status as keyof typeof statusConfig];
            if (!config) return null;

            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                className="p-3 rounded-lg bg-white/50 border border-transparent hover:border-[#FFE0C2] transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-[#A65F33] leading-tight">
                      <span className="text-[#FFA142] font-black">{item.quantity}x</span> {item.name}
                    </p>
                    {item.notes && (
                      <div className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700 p-2 bg-red-50 rounded-md">
                        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                        <span className="italic">{item.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-xs font-bold shrink-0", config.color)}>
                    <config.icon size={14} className={item.status === 'pendiente' ? 'animate-spin' : ''} />
                    {config.label}
                  </div>
                </div>

                {/* ✅ Tipo de Pedido */}
                {item.orderType && (
                  <div className="mt-2 flex items-center gap-1.5">
                    {item.orderType === "mesa" && (
                      <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        <Store size={12} />
                        <span>En Mesa</span>
                      </div>
                    )}
                    {item.orderType === "para-llevar" && (
                      <div className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                        <ShoppingBag size={12} />
                        <span>Para Llevar</span>
                      </div>
                    )}
                    {item.orderType === "delivery" && (
                      <div className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                        <Bike size={12} />
                        <span>Delivery</span>
                      </div>
                    )}
                  </div>
                )}
                <Button
                  size="sm"
                  variant={config.nextAction.variant}
                  className={cn("w-full mt-3 h-9 font-bold transition-transform duration-200 active:scale-95", config.nextAction.className)}
                  onClick={() => handleUpdateStatus(item.id, config.nextAction.status)}
                >
                  {config.nextAction.label}
                </Button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Estado de Comanda Completada */}
      <AnimatePresence>
        {isComandaReady && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 text-center bg-green-100 border-t-2 border-dashed border-green-300">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
              <h4 className="mt-2 text-lg font-bold text-green-800">¡Comanda Lista!</h4>
              <p className="text-sm text-green-700">Se ha enviado una notificación al mozo.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}