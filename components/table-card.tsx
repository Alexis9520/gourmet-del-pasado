"use client"

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, UtensilsCrossed, Bell, ShoppingBasket, BookMarked, CircleDollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Table } from "@/lib/store";

// Tipo para el estado visual que derivaremos de la mesa
type VisualTableState = 'libre' | 'atendida' | 'atencion requerida' | 'listo para servir' | 'reservada' | 'pago pendiente';

// Hook para calcular y actualizar el tiempo transcurrido
const useTimeElapsed = (startTime?: Date) => {
    const [elapsed, setElapsed] = useState("0m");

    useEffect(() => {
        if (!startTime) return;

        const calculateElapsed = () => {
            const now = new Date();
            const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60); // Diferencia en minutos
            const hours = Math.floor(diff / 60);
            const minutes = diff % 60;
            if (hours > 0) {
                setElapsed(`${hours}h ${minutes}m`);
            } else {
                setElapsed(`${minutes}m`);
            }
        };

        calculateElapsed();
        const interval = setInterval(calculateElapsed, 60000); // Actualiza cada minuto

        return () => clearInterval(interval);
    }, [startTime]);

    return elapsed;
};

export function TableCard({ table, onClick }: { table: Table; onClick: () => void }) {
    
    const timeElapsed = useTimeElapsed(table.startTime);
    
    // Lógica para determinar el estado visual y la información contextual
    const { visualState, itemsReadyCount } = useMemo(() => {
        let state: VisualTableState = 'libre';
        let readyCount = 0;

        if (table.status === 'reservado') state = 'reservada';
        else if (table.status === 'pago pendiente') state = 'pago pendiente';
        else if (table.status === 'ocupado') {
            readyCount = table.orders.filter(o => o.status === 'listo').length;
            if (readyCount > 0) {
                state = 'listo para servir';
            } else if (table.orders.some(o => o.status === 'pendiente')) {
                state = 'atencion requerida';
            } else {
                state = 'atendida';
            }
        }
        return { visualState: state, itemsReadyCount: readyCount };
    }, [table.status, table.orders]);

    // Configuración centralizada para estilos y contenido, usando tu paleta de colores
    const config = {
        'libre': {
            Icon: Users,
            label: "Libre",
            details: `${table.seats} Asientos`,
            style: "bg-[#7DBB3C] text-white",
        },
        'atendida': {
            Icon: UtensilsCrossed,
            label: `S/ ${table.total.toFixed(2)}`,
            details: timeElapsed,
            detailsIcon: Clock,
            style: "bg-[#FFF3E5] text-[#A65F33] border-2 border-[#FFE0C2]",
        },
        'atencion requerida': {
            Icon: ShoppingBasket,
            label: `S/ ${table.total.toFixed(2)}`,
            details: "Actualizando...",
            pulse: true,
            style: "bg-[#FFA142] text-white",
        },
        'listo para servir': {
            Icon: Bell,
            label: `${itemsReadyCount} Plato${itemsReadyCount > 1 ? 's' : ''} Listo${itemsReadyCount > 1 ? 's' : ''}`,
            details: timeElapsed,
            detailsIcon: Clock,
            pulse: true,
            style: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
        },
        'reservada': {
            Icon: BookMarked,
            label: "Reservada",
            details: table.reservedTime || '',
            detailsIcon: Clock,
            style: "bg-[#FF7043] text-white",
        },
        'pago pendiente': {
            Icon: CircleDollarSign,
            label: `S/ ${table.total.toFixed(2)}`,
            details: "Pendiente de cobro",
            style: "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white",
        },
    }[visualState];

    const DetailsIcon = config.detailsIcon;

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 15 }}
            layout
            className={cn(
                "group relative flex h-44 w-40 flex-col justify-between overflow-hidden rounded-2xl p-4 font-sans shadow-lg outline-none transition-shadow duration-300 hover:shadow-xl",
                config.style
            )}
        >
            {/* Indicador de pulso para estados de alta prioridad */}
            {config.pulse && (
                <span className="absolute top-3 right-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
            )}

            {/* Parte superior: Ícono y Número de Mesa */}
            <div className="relative z-10 text-left">
                <config.Icon className="h-7 w-7 mb-1 opacity-80" />
                <span className="text-3xl font-bold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
                    Mesa {table.number}
                </span>
            </div>

            {/* Parte inferior: Etiqueta y Detalles */}
            <div className="relative z-10 text-left">
                <span className="block font-bold text-lg leading-tight">{config.label}</span>
                {config.details && (
                    <div className="flex items-center gap-1.5 text-xs font-medium opacity-80 mt-1">
                        {DetailsIcon && <DetailsIcon size={12} />}
                        <span>{config.details}</span>
                    </div>
                )}
            </div>
        </motion.button>
    );
}
