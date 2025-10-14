"use client"

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, CreditCard, BarChart3, Settings, LogOut, History, ChevronRight } from "lucide-react";
import { usePOSStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Mapa de Mesas", href: "/tables", icon: LayoutGrid, roles: ["admin", "waiter"] },
  { name: "Caja", href: "/cashier", icon: CreditCard, roles: ["admin", "cashier"] },
  { name: "Reportes", href: "/reports", icon: BarChart3, roles: ["admin"] },
  { name: "Historial", href: "/history", icon: History, roles: ["admin", "cashier"] },
  { name: "Administración", href: "/admin", icon: Settings, roles: ["admin"] },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { currentUser, logout } = usePOSStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredNav = navigation.filter((item) => (currentUser ? item.roles.includes(currentUser.role) : false));

  return (
    <motion.aside
      animate={{ width: isExpanded ? "256px" : "80px" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      // ✅ CAMBIO 1: Se quita 'justify-between' para un control más explícito del layout
      className={cn(
        "flex h-screen flex-col border-r bg-[#FFF3E5] py-5",
        "border-[#FFE0C2]",
        className
      )}
    >
      {/* Contenedor principal que crece para empujar el footer hacia abajo */}
      <div className="flex flex-1 flex-col">
        {/* Logo */}
        <div className={cn("flex items-center gap-4 px-5", !isExpanded && "justify-center")}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFA142] text-white font-bold text-lg shadow-md"
          >
            QG
          </motion.div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold text-[#A65F33] whitespace-nowrap"
              >
                Quantify Gourmet
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ✅ CAMBIO 2: La navegación ahora está dentro del contenedor que crece */}
        <nav className="mt-8 flex flex-col gap-2 px-3">
          {filteredNav.map((item) => (
            <NavItem key={item.name} item={item} isExpanded={isExpanded} />
          ))}
        </nav>
      </div>

      {/* Footer de la Sidebar que ahora siempre estará al final */}
      <div className="flex flex-col gap-2 px-3">
        <NavItem
          item={{ name: 'Cerrar Sesión', href: '#', icon: LogOut }}
          isExpanded={isExpanded}
          isLogoutButton={true}
          onClick={logout}
        />
        {/* Este botón ahora será visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-12 items-center rounded-lg px-4 text-[#A65F33]/70 transition-colors hover:bg-[#FFF5ED] hover:text-[#A65F33]"
        >
          <ChevronRight className={cn("h-6 w-6 shrink-0 transition-transform duration-300", isExpanded && "rotate-180")} />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-4 whitespace-nowrap font-semibold"
              >
                Cerrar Menú
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}


// --- El subcomponente NavItem permanece igual ---
function NavItem({ item, isExpanded, isLogoutButton = false, onClick }: { item: any; isExpanded: boolean; isLogoutButton?: boolean; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = !isLogoutButton && pathname === item.href;
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  const content = (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex h-12 w-full items-center gap-4 rounded-lg px-4 transition-colors duration-200",
        isActive
          ? "bg-[#FFA142] text-white shadow-md shadow-orange-300/60"
          : isLogoutButton
            ? "text-[#A65F33]/70 hover:bg-red-500/10 hover:text-red-600"
            : "text-[#A65F33]/70 hover:bg-[#FFF5ED] hover:text-[#A65F33]",
      )}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
            exit={{ opacity: 0, x: -10 }}
            className="whitespace-nowrap font-semibold"
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHovered && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-full ml-4 whitespace-nowrap rounded-md bg-[#A65F33] px-3 py-1.5 text-sm font-semibold text-white shadow-lg"
          >
            {item.name}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return isLogoutButton ? (
    <button onClick={onClick} className="w-full">{content}</button>
  ) : (
    <Link href={item.href}>{content}</Link>
  );
}