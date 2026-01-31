"use client"

import { usePOSStore } from "@/lib/store"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card } from "@/components/ui/card"

export default function CashHistory() {
  const { cashSession, cashSessions } = usePOSStore();

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#A65F33]">Caja (Actual)</h3>
        {cashSession ? (
          <div className="mt-2 bg-white rounded-lg border border-[#FFE0C2] p-3 shadow-sm">
            <div className="text-xs text-[#A65F33]/70">Abierta por</div>
            <div className="font-bold text-[#A65F33]">{cashSession.user}</div>
            <div className="mt-2 text-sm">Inicial: S/ {cashSession.startAmount.toFixed(2)}</div>
            <div className="text-sm">Ventas: S/ {cashSession.salesTotal.toFixed(2)}</div>
            <div className="text-sm">Desde: {format(new Date(cashSession.startTime), "dd MMM yyyy HH:mm", { locale: es })}</div>
          </div>
        ) : (
          <div className="mt-2 text-sm text-[#A65F33]/60">No hay caja abierta</div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#A65F33]">Historial de Cierres</h3>
        <div className="mt-2 space-y-2 max-h-56 overflow-auto">
          {(cashSessions || []).slice().reverse().map((s) => (
            <div key={s.id} className="bg-white rounded-lg border border-[#FFE0C2] p-3 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-[#A65F33]">{s.user}</div>
                  <div className="text-xs text-[#A65F33]/70">{format(new Date(s.startTime), "dd MMM yyyy HH:mm", { locale: es })} - {s.endTime ? format(new Date(s.endTime), "dd MMM yyyy HH:mm", { locale: es }) : '—'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#FFA142]">S/ {(s.endAmount ?? (s.startAmount + s.salesTotal)).toFixed(2)}</div>
                  <div className={`text-xs ${s.difference && s.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>{s.difference ? `${s.difference >= 0 ? '+' : '-'}S/ ${Math.abs(s.difference).toFixed(2)}` : ''}</div>
                </div>
              </div>
            </div>
          ))}
          {(cashSessions || []).length === 0 && (
            <div className="text-sm text-[#A65F33]/60">No hay cierres registrados.</div>
          )}
        </div>
      </div>
    </div>
  )
}
