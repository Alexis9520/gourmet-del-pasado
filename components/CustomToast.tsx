"use client";

import { motion } from "framer-motion";
import { X, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Toast } from "react-hot-toast"; // ✅ 1. Importamos el tipo 'Toast'

// ✅ 2. Creamos un tipo específico para los tipos de notificación
type NotificationType = "success" | "info" | "warning";

// El objeto 'icons' se mantiene igual
const icons: Record<NotificationType, { Icon: React.ElementType; className: string }> = {
  success: { Icon: CheckCircle2, className: "bg-green-100 text-green-600" },
  info: { Icon: Info, className: "bg-blue-100 text-blue-600" },
  warning: { Icon: AlertTriangle, className: "bg-orange-100 text-orange-600" },
};

// ✅ 3. Creamos la interfaz para las props del componente
interface CustomToastProps {
  t: Toast; // El objeto que nos pasa react-hot-toast
  id: string;
  type: NotificationType;
  message: string;
  onDismiss: () => void;
}

export default function CustomToast({ t, id, type, message, onDismiss }: CustomToastProps) { // ✅ 4. Aplicamos la interfaz aquí
  const { Icon, className } = icons[type] || icons.info;

  return (
    <motion.div
      // La propiedad 'visible' de 't' nos ayuda a controlar las animaciones de entrada/salida
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={t.visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.9 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-xl border bg-white shadow-lg",
        "border-[#FFE0C2]"
      )}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Ícono Estilizado */}
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", className)}>
          <Icon size={24} />
        </div>
        {/* Mensaje */}
        <div className="flex-1 pt-1">
          <p className="text-base font-semibold text-[#A65F33]">{message}</p>
        </div>
        {/* Botón de Cerrar */}
        <button
          onClick={onDismiss}
          className="rounded-full p-1 text-[#A65F33]/50 transition-colors hover:bg-[#FFF3E5] hover:text-[#A65F33]"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Barra de Progreso */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-[#FFA142]"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
      />
    </motion.div>
  );
}