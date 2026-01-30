"use client"

import { OrderItem, Table } from "@/lib/store"
import { Store, ShoppingBag, Bike } from "lucide-react"

interface PrintTicketProps {
  table: Table
  items: Omit<OrderItem, "id" | "status">[]
  ticketNumber?: number
}

export function PrintTicket({ table, items, ticketNumber }: PrintTicketProps) {
  const currentDate = new Date()
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const orderTypeIcon = {
    "mesa": <Store className="h-3 w-3" />,
    "para-llevar": <ShoppingBag className="h-3 w-3" />,
    "delivery": <Bike className="h-3 w-3" />
  }

  const orderTypeLabel = {
    "mesa": "MESA",
    "para-llevar": "PARA LLEVAR",
    "delivery": "DELIVERY"
  }

  return (
    <div className="print-ticket hidden print:block w-[80mm] mx-auto bg-white text-black font-mono text-sm p-4">
      {/* Header */}
      <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3">
        <h1 className="text-xl font-bold">LA POSADA</h1>
        <p className="text-xs mt-1">Pollería & Restaurante</p>
        <p className="text-xs">RUC: 20XXXXXXXXX</p>
        <p className="text-xs mt-1">{currentDate.toLocaleString('es-PE')}</p>
      </div>

      {/* Ticket Type */}
      <div className="text-center border-b border-dashed border-black pb-2 mb-3">
        <h2 className="text-lg font-bold">PRE-CUENTA #{ticketNumber || 1}</h2>
        <p className="text-sm">Mesa {table.number}</p>
        {table.waiter && <p className="text-xs">Mozo: {table.waiter}</p>}
      </div>

      {/* Items */}
      <div className="border-b-2 border-dashed border-black pb-3 mb-3">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>CANT.</span>
          <span>DESCRIPCIÓN</span>
          <span>IMPORTE</span>
        </div>

        {items.map((item, index) => (
          <div key={index} className="mb-2 text-xs">
            <div className="flex justify-between">
              <span className="font-bold">{item.quantity}x</span>
              <span className="flex-1 px-2">{item.name}</span>
              <span className="font-bold">S/ {(item.price * item.quantity).toFixed(2)}</span>
            </div>

            {/* Order Type Badge */}
            <div className="flex items-center gap-1 ml-4 mt-0.5 text-[10px]">
              {orderTypeIcon[item.orderType]}
              <span>{orderTypeLabel[item.orderType]}</span>
            </div>

            {item.notes && (
              <div className="ml-4 mt-0.5 text-[10px] italic">
                Nota: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-b-2 border-dashed border-black pb-3 mb-3">
        <div className="flex justify-between text-base font-bold">
          <span>SUBTOTAL:</span>
          <span>S/ {subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Notes */}
      {table.notes && (
        <div className="border-b border-dashed border-black pb-2 mb-3">
          <p className="text-xs font-bold">OBSERVACIONES:</p>
          <p className="text-xs mt-1">{table.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs mt-4">
        <p className="font-bold">DOCUMENTO NO VÁLIDO COMO COMPROBANTE</p>
        <p className="mt-1">Pre-Cuenta para control interno</p>
        <p className="mt-2">¡Gracias por su preferencia!</p>
        <p className="mt-1">Pollería y Restaurante</p>
      </div>
    </div>
  )
}

// Utility function to trigger print
export function printTicket(table: Table, items: Omit<OrderItem, "id" | "status">[], ticketNumber?: number, amountPaid?: number, change?: number) {
  // Create a hidden container
  const printContainer = document.createElement('div')
  printContainer.style.position = 'fixed'
  printContainer.style.top = '-9999px'
  printContainer.style.left = '-9999px'
  document.body.appendChild(printContainer)

  // Render ticket
  const ticketHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        @media print {
          body {
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          
          .print-ticket {
            display: block !important;
            width: 80mm;
            margin: 0;
            padding: 5mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: black;
            background: white;
          }
          
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .border-dashed { border-style: dashed; }
          .border-black { border-color: black; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .items-center { align-items: center; }
        }
      </style>
    </head>
    <body>
      <div class="print-ticket">
        <!-- Header -->
        <div class="text-center border-b-2 border-dashed border-black" style="padding-bottom: 8px; margin-bottom: 8px;">
          <h1 style="font-size: 18px; margin: 0; font-weight: bold;">LA POSADA</h1>
          <p style="font-size: 10px; margin: 2px 0;">Pollería & Restaurante</p>
          <p style="font-size: 10px; margin: 0;">RUC: 20XXXXXXXXX</p>
          <p style="font-size: 10px; margin: 4px 0;">${new Date().toLocaleString('es-PE')}</p>
        </div>

        <!-- Ticket Type -->
        <div class="text-center border-b border-dashed border-black" style="padding-bottom: 6px; margin-bottom: 8px;">
          <h2 style="font-size: 16px; margin: 0; font-weight: bold;">PRE-CUENTA #${ticketNumber || 1}</h2>
          <p style="font-size: 12px; margin: 2px 0;">Mesa ${table.number}</p>
          ${table.waiter ? `<p style="font-size: 10px; margin: 0;">Mozo: ${table.waiter}</p>` : ''}
        </div>

        <!-- Items -->
        <div class="border-b-2 border-dashed border-black" style="padding-bottom: 8px; margin-bottom: 8px;">
          <div class="flex justify-between" style="font-size: 10px; font-weight: bold; margin-bottom: 6px;">
            <span>CANT.</span>
            <span>DESCRIPCIÓN</span>
            <span>IMPORTE</span>
          </div>
          
          ${items.map((item) => `
            <div style="margin-bottom: 6px; font-size: 10px;">
              <div class="flex justify-between">
                <span style="font-weight: bold;">${item.quantity}x</span>
                <span style="flex: 1; padding: 0 4px;">${item.name}</span>
                <span style="font-weight: bold;">S/ ${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <div style="margin-left: 12px; margin-top: 2px; font-size: 9px;">
                [${item.orderType.toUpperCase()}]
              </div>
              ${item.notes ? `<div style="margin-left: 12px; margin-top: 2px; font-size: 9px; font-style: italic;">Nota: ${item.notes}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Total -->
        <div class="border-b-2 border-dashed border-black" style="padding-bottom: 8px; margin-bottom: 8px;">
          <div class="flex justify-between" style="font-size: 14px; font-weight: bold;">
            <span>TOTAL:</span>
            <span>S/ ${items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
          </div>
          ${ticketNumber === 0 && amountPaid ? `
            <div class="flex justify-between" style="font-size: 12px; margin-top: 4px;">
                <span>RECIBIDO:</span>
                <span>S/ ${amountPaid.toFixed(2)}</span>
            </div>
            <div class="flex justify-between" style="font-size: 14px; font-weight: bold; margin-top: 2px;">
                <span>VUELTO:</span>
                <span>S/ ${(change || 0).toFixed(2)}</span>
            </div>
          ` : ''}
        </div>

        ${table.notes ? `
        <div class="border-b border-dashed border-black" style="padding-bottom: 6px; margin-bottom: 8px;">
          <p style="font-size: 10px; font-weight: bold; margin: 0;">OBSERVACIONES:</p>
          <p style="font-size: 10px; margin: 2px 0;">${table.notes}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="text-center" style="font-size: 10px; margin-top: 12px;">
          <p style="font-weight: bold; margin: 0;">DOCUMENTO NO VÁLIDO COMO COMPROBANTE</p>
          <p style="margin: 2px 0;">Pre-Cuenta para control interno</p>
          <p style="margin: 6px 0;">¡Gracias por su preferencia!</p>
          <p style="margin: 2px 0;">Pollería y Restaurante</p>
        </div>
      </div>
    </body>
    </html>
  `

  // Open print window
  const printWindow = window.open('', '', 'width=300,height=600')
  if (printWindow) {
    printWindow.document.write(ticketHTML)
    printWindow.document.close()

    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  // Clean up
  setTimeout(() => {
    document.body.removeChild(printContainer)
  }, 1000)
}
