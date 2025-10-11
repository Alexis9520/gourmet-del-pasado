// En la misma carpeta components/history

"use client";

import type { CompletedOrder } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface HistoryDetailModalProps {
  order: CompletedOrder;
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryDetailModal({ order, isOpen, onClose }: HistoryDetailModalProps) {
  const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
  const dateTimeFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'full', timeStyle: 'medium' });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalle del Pedido #{order.tableNumber}</DialogTitle>
          <DialogDescription>
            {dateTimeFormatter.format(order.completionTime)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Items del Pedido</h4>
            <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
              {order.items.map(item => (
                <li key={item.id}>
                  {item.quantity}x {item.name} - {currencyFormatter.format(item.price * item.quantity)}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t pt-4 mt-2 flex justify-between items-center font-bold">
            <span>Total Pagado:</span>
            <span>{currencyFormatter.format(order.total)}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-muted-foreground">Mesero:</span>
            <span>{order.waiter || 'N/A'}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-muted-foreground">Método de Pago:</span>
            <span className="capitalize">{order.paymentMethod}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}