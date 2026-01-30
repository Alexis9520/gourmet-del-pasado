"use client";

import { useState } from "react";
import { usePOSStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, Receipt, DollarSign, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export function CashGuard({ children }: { children: React.ReactNode }) {
    const { cashSession, openRegister, currentUser } = usePOSStore();
    const [startAmount, setStartAmount] = useState("");

    const handleOpenRegister = () => {
        const amount = parseFloat(startAmount);
        if (isNaN(amount) || amount < 0) {
            toast.error("Ingresa un monto válido");
            return;
        }
        openRegister(amount, currentUser?.name || "Cajero");
        toast.success("Caja abierta correctamente");
    };

    if (cashSession && cashSession.isOpen) {
        return <>{children}</>;
    }

    return (
        <div className="flex items-center justify-center min-h-[500px] h-full bg-[#FFF5ED] p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100"
            >
                <div className="bg-[#FFA142] p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <PiggyBank size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Apertura de Caja</h2>
                    <p className="text-orange-50/90 text-sm mt-1">Ingresa el monto inicial para comenzar el turno.</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-gray-700 font-semibold flex items-center gap-2">
                            <DollarSign size={16} /> Monto Inicial en Efectivo
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">S/</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-10 text-xl font-bold border-orange-200 focus:ring-orange-500 h-12"
                                value={startAmount}
                                onChange={(e) => setStartAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-gray-400">Este monto se usará para calcular el cuadre final.</p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                        <div className="flex items-start gap-3">
                            <div className="bg-orange-100 p-2 rounded-full">
                                <Receipt size={16} className="text-orange-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-800 text-sm">Registro Automático</h4>
                                <p className="text-xs text-orange-600/80 mt-1">
                                    Todas las ventas realizadas en este turno se sumarán automáticamente a esta sesión.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleOpenRegister}
                        className="w-full bg-[#FFA142] hover:bg-[#FF8C00] text-white h-12 text-lg shadow-lg shadow-orange-200"
                    >
                        Abrir Caja <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
