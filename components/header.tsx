"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, User, Settings, LogOut, CheckCircle2, Info, AlertTriangle, X } from "lucide-react"
import { usePOSStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useClickOutside } from "@/hooks/useClickOutside" // Importamos el nuevo hook

const NotificationIcon = ({ type }: { type: string }) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  };
  return icons[type as keyof typeof icons] || <Info className="h-5 w-5 text-blue-500" />;
};

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  // Obtenemos más datos y acciones del store
  const { currentUser, notifications, logout, removeNotification, clearAllNotifications } = usePOSStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const notificationPanelRef = useClickOutside<HTMLDivElement>(() => {
    setIsNotificationPanelOpen(false);
  });

  // Efecto para actualizar el reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    // Limpieza al desmontar el componente para evitar fugas de memoria
    return () => clearInterval(timer)
  }, [])

  // Variantes para la animación del menú desplegable
  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } },
  } as const
  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } },
  } as const;

  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center justify-between border-b bg-[#FFF3E5] px-4 sm:px-6", // Fondo: Crema Suave
        "border-[#FFE0C2]", // Borde: Durazno Pálido
        className
      )}
    >
      {/* --- Lado Izquierdo: Logo y Nombre --- */}
      <div className="flex items-center gap-3">

        <h1 className="hidden text-xl font-bold text-[#A65F33] sm:block"></h1> {/* Texto: Marrón Oscuro */}
      </div>

      {/* --- Lado Derecho: Acciones y Usuario --- */}
      {currentUser && (
        <div className="flex items-center gap-4">
          {/* Reloj en Tiempo Real */}
          <div className="hidden text-center md:block">
            <div className="font-semibold text-[#A65F33]">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-[#A65F33]/70">
              {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>

          {/* ✅ CONTENEDOR DE NOTIFICACIONES MEJORADO */}
          <div className="relative" ref={notificationPanelRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
              className="relative rounded-full p-2 text-[#A65F33]/80 transition-colors hover:bg-[#FFE0C2] hover:text-[#A65F33]"
            >
              <Bell size={22} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#FFF3E5]"></span>
                </span>
              )}
            </motion.button>

            {/* Panel de Notificaciones */}
            <AnimatePresence>
              {isNotificationPanelOpen && (
                <motion.div
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-14 right-0 z-20 w-80 origin-top-right rounded-lg border border-[#FFE0C2] bg-white shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-[#FFE0C2] p-3">
                    <h3 className="font-semibold text-[#A65F33]">Notificaciones</h3>
                    {notifications.length > 0 && (
                      <button onClick={clearAllNotifications} className="text-xs font-semibold text-[#FFA142] hover:underline">
                        Limpiar todo
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-sm text-[#A65F33]/70">
                        No tienes notificaciones nuevas.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {notifications.map(notification => (
                          <div key={notification.id} className="group flex items-start gap-3 rounded-md p-2 hover:bg-[#FFF5ED]">
                            <NotificationIcon type={notification.type} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#A65F33]">{notification.message}</p>
                              <p className="text-xs text-[#A65F33]/60">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: es })}
                              </p>
                            </div>
                            <button onClick={() => removeNotification(notification.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                               <X size={16} className="text-[#A65F33]/50 hover:text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar y Menú Desplegable del Usuario */}
          <div className="relative">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFA142] text-xl font-bold text-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#FFA142] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF3E5]"
            >
              {currentUser.name.charAt(0)}
            </motion.button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-14 right-0 z-20 w-56 origin-top-right rounded-lg border border-[#FFE0C2] bg-white p-2 shadow-xl"
                >
                  <div className="border-b border-[#FFE0C2] px-3 py-2">
                    <p className="text-sm font-semibold text-[#A65F33]">{currentUser.name}</p>
                    <p className="text-xs capitalize text-[#A65F33]/70">{currentUser.role}</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <MenuItem icon={User}>Ver Perfil</MenuItem>
                    <MenuItem icon={Settings}>Configuración</MenuItem>
                    <MenuItem icon={LogOut} onClick={logout}>Cerrar Sesión</MenuItem>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </header>
  )
}

// Pequeño componente para los ítems del menú para mantener el código limpio
function MenuItem({ children, icon: Icon, onClick }: { children: React.ReactNode, icon: React.ElementType, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#A65F33] transition-colors hover:bg-[#FFF5ED]"
    >
      <Icon size={16} className="opacity-80" />
      <span>{children}</span>
    </button>
  );
}