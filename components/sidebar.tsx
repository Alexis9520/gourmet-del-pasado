"use client"

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, CreditCard, BarChart3, Settings, LogOut, History, ChevronRight, UtensilsCrossed, Calendar, Store, Layers, Users } from "lucide-react";
import { usePOSStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Definición de Grupos de Navegación
const navigationGroups = [
  {
    title: "Operativo",
    items: [
      { name: "Mapa de Mesas", href: "/tables", icon: LayoutGrid, roles: ["admin", "waiter"] },
      { name: "Caja", href: "/cashier", icon: CreditCard, roles: ["admin", "cashier"] },
    ]
  },
  {
    title: "Gestión",
    items: [
      { name: "Gestión de Platos", href: "/admin/dishes", icon: UtensilsCrossed, roles: ["admin"] },
      { name: "Gestión de Menús", href: "/admin/menus", icon: Calendar, roles: ["admin"] },
    ]
  },
  {
    title: "Análisis",
    items: [
      { name: "Reportes", href: "/reports", icon: BarChart3, roles: ["admin"] },
      { name: "Ventas Mozos", href: "/admin/waiter-sales", icon: Users, roles: ["admin"] },
      { name: "Historial", href: "/history", icon: History, roles: ["admin", "cashier", "waiter"] },
    ]
  },
  {
    title: "Sistema",
    items: [
      { name: "Administración", href: "/admin", icon: Settings, roles: ["admin"] },
    ]
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { currentUser, logout } = usePOSStore();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? "260px" : "80px" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "flex h-screen flex-col border-r bg-[#FFF3E5] py-5 transition-all",
        "border-[#FFE0C2]",
        className
      )}
    >
      {/* --- Header / Logo --- */}
      <div className={cn("flex items-center gap-4 px-5 mb-6", !isExpanded && "justify-center")}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFA142] to-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-300/50"
        >
          QG
        </motion.div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-lg font-bold text-[#A65F33] whitespace-nowrap leading-none">La Posada</span>
              <span className="text-sm font-medium text-[#A65F33]/60 whitespace-nowrap">Pollería y Restaurante</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Navigation Area --- */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar">
        {navigationGroups.map((group, groupIndex) => {
          // Filter items based on user role
          const filteredItems = group.items.filter(item =>
            currentUser ? item.roles.includes(currentUser.role) : false
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-2">
              <AnimatePresence>
                {isExpanded && (
                  <motion.h3
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.1 }}
                    className="px-4 text-[11px] font-bold uppercase tracking-wider text-[#A65F33]/40"
                  >
                    {group.title}
                  </motion.h3>
                )}
              </AnimatePresence>

              {/* Separator line when collapsed to keep visual grouping */}
              {!isExpanded && groupIndex > 0 && (
                <div className="mx-auto w-8 h-px bg-[#A65F33]/10 my-2" />
              )}

              <nav className="flex flex-col gap-1">
                {filteredItems.map((item) => (
                  <NavItem key={item.name} item={item} isExpanded={isExpanded} />
                ))}
              </nav>
            </div>
          );
        })}
      </div>

      {/* --- Footer / Actions --- */}
      <div className="flex flex-col gap-2 px-3 mt-4 pt-4 border-t border-[#FFE0C2]/50">
        <NavItem
          item={{ name: 'Cerrar Sesión', href: '#', icon: LogOut }}
          isExpanded={isExpanded}
          isLogoutButton={true}
          onClick={logout}
        />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex h-10 items-center justify-center rounded-lg text-[#A65F33]/60 transition-colors hover:bg-[#FFF5ED] hover:text-[#A65F33]",
            isExpanded ? "w-full" : "w-full"
          )}
        >
          {isExpanded ? (
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <ChevronRight className="h-4 w-4 rotate-180" /> Colapsar Menú
            </div>
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}

// --- NavItem Component ---
function NavItem({ item, isExpanded, isLogoutButton = false, onClick }: { item: any; isExpanded: boolean; isLogoutButton?: boolean; onClick?: () => void }) {
  const pathname = usePathname();
  //   const isActive = !isLogoutButton && pathname === item.href;
  // Mejor check de actividad para incluir subrutas
  const isActive = !isLogoutButton && (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/'));

  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  const content = (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 transition-all duration-200 group cursor-pointer",
        isExpanded ? "h-11 justify-start" : "h-11 justify-center", // Expanded: Left align, Collapsed: Center
        isActive
          ? "bg-gradient-to-r from-orange-100 to-[#FFF3E5] text-orange-700 shadow-sm border border-orange-200/50" // Active State
          : isLogoutButton
            ? "text-[#A65F33]/70 hover:bg-red-50 hover:text-red-600"
            : "text-[#A65F33]/70 hover:bg-white/50 hover:text-orange-600 hover:shadow-sm", // Inactive Hover
      )}
    >
      {/* Active Indicator Line (Left) */}
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-orange-500"
        />
      )}

      <Icon className={cn("shrink-0 transition-colors", isExpanded ? "h-5 w-5" : "h-6 w-6", isActive ? "text-orange-600" : "text-current")} />

      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            className={cn("whitespace-nowrap text-sm font-medium", isActive ? "font-bold" : "")}
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip for Collapsed Mode */}
      <AnimatePresence>
        {isHovered && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl z-50 border border-white/10"
          >
            {item.name}
            {/* Small Arrow */}
            <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return isLogoutButton ? (
    <button onClick={onClick} className="w-full focus:outline-none">{content}</button>
  ) : (
    <Link href={item.href} className="w-full focus:outline-none">{content}</Link>
  );
}