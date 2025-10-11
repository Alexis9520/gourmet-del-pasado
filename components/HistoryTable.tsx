// Crear la carpeta components/history y dentro este archivo

"use client";

import type { CompletedOrder } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface HistoryTableProps {
  orders: CompletedOrder[];
  onRowClick: (order: CompletedOrder) => void;
}

export function HistoryTable({ orders, onRowClick }: HistoryTableProps) {
  // Formateador para la moneda local (Sol Peruano)
  const currencyFormatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  });
  
  // Formateador para la fecha y hora
  const dateTimeFormatter = new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha y Hora</TableHead>
          <TableHead className="text-center">Mesa</TableHead>
          <TableHead>Mesero</TableHead>
          <TableHead>Método de Pago</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
              Aún no hay transacciones completadas.
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id} onClick={() => onRowClick(order)} className="cursor-pointer hover:bg-muted/50">
              <TableCell>{dateTimeFormatter.format(order.completionTime)}</TableCell>
              <TableCell className="text-center">{order.tableNumber}</TableCell>
              <TableCell>{order.waiter || "N/A"}</TableCell>
              <TableCell className="capitalize">{order.paymentMethod}</TableCell>
              <TableCell className="text-right font-medium">{currencyFormatter.format(order.total)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}