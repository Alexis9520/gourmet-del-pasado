"use client";

import { useState } from "react";
import { usePOSStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";  // Fixed import path if needed, assuming default shadcn structure
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calculator, CheckCircle, AlertTriangle, ArrowRight, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

export function CloseRegisterModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { cashSession, closeRegister } = usePOSStore();
    const [endAmount, setEndAmount] = useState("");
    const [notes, setNotes] = useState("");

    if (!cashSession) return null;

    const startAmount = cashSession.startAmount;
    const salesTotal = cashSession.salesTotal;
    const expectedTotal = startAmount + salesTotal;

    const realAmount = parseFloat(endAmount) || 0;
    const difference = realAmount - expectedTotal;

    const handleCloseRegister = () => {
        if (isNaN(realAmount) || realAmount < 0) {
            toast.error("Ingresa un monto final válido");
            return;
        }
        closeRegister(realAmount, notes);
        toast.success("Caja cerrada correctamente");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] border-0 bg-white shadow-2xl rounded-2xl">
                <DialogHeader className="bg-orange-50/50 p-6 rounded-t-2xl border-b border-orange-100">
                    <DialogTitle className="text-2xl font-bold text-orange-900 flex items-center gap-2">
                        <Calculator className="text-orange-500" /> Corte de Caja
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Fondo Inicial</p>
                            <p className="text-lg font-bold text-gray-800">S/ {startAmount.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <p className="text-xs text-green-600 font-semibold uppercase">Ventas Turno</p>
                            <p className="text-lg font-bold text-green-700">S/ {salesTotal.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 bg-orange-50 rounded-xl border border-orange-200">
                        <span className="font-bold text-orange-900">Total Esperado en Caja</span>
                        <span className="font-black text-2xl text-orange-600">S/ {expectedTotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="endAmount" className="text-gray-700 font-bold flex items-center gap-2">
                            <DollarSign size={16} /> Dinero Real en Caja (Conteo)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">S/</span>
                            <Input
                                id="endAmount"
                                type="number"
                                placeholder="0.00"
                                className="pl-10 text-xl font-bold border-gray-300 focus:ring-orange-500 h-12"
                                value={endAmount}
                                onChange={(e) => setEndAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Difference Indicator */}
                    {endAmount !== "" && (
                        <div className={cn(
                            "p-3 rounded-lg flex items-center gap-3 border transition-all",
                            difference === 0 ? "bg-green-50 border-green-200 text-green-700" :
                                difference > 0 ? "bg-blue-50 border-blue-200 text-blue-700" :
                                    "bg-red-50 border-red-200 text-red-700"
                        )}>
                            {difference === 0 ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            <div className="flex-1 flex justify-between items-center">
                                <span className="font-semibold text-sm">
                                    {difference === 0 ? "Cuadre Perfecto" :
                                        difference > 0 ? "Sobrante" : "Faltante"}
                                </span>
                                <span className="font-bold text-lg">
                                    {difference > 0 ? "+" : ""}{difference.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-gray-700 font-semibold">Observaciones</Label>
                        <Textarea
                            id="notes"
                            placeholder="Notas opcionales sobre el cierre..."
                            className="resize-none border-gray-200 focus:ring-orange-500"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2">
                    <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-800">Cancelar</Button>
                    <Button
                        onClick={handleCloseRegister}
                        className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 px-6 font-bold"
                    >
                        Cerrar Caja
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Simple Textarea component if not exists (fallback)
function Button_Fallback({ className, ...props }: any) {
    return <button className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4", className)} {...props} />
}
