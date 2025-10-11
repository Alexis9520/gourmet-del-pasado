"use client"
import { History } from 'lucide-react';
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, CreditCard, BarChart3, Settings, LogOut } from "lucide-react"
import { usePOSStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface SidebarProps {                   // <<< NUEVA LÍNEA
  className?: string;                     // <<< NUEVA LÍNEA
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { currentUser, logout } = usePOSStore()

  const navigation = [
    { name: "Mapa de Mesas", href: "/tables", icon: LayoutGrid, roles: ["admin", "waiter"] },
    { name: "Caja", href: "/cashier", icon: CreditCard, roles: ["admin", "cashier"] },
    { name: "Reportes", href: "/reports", icon: BarChart3, roles: ["admin"] },
    { name: "Historial", href: "/history", icon: History, roles: ["admin", "cashier"] },
    { name: "Administración", href: "/admin", icon: Settings, roles: ["admin"] },
  ]

  const filteredNav = navigation.filter((item) => (currentUser ? item.roles.includes(currentUser.role) : false))

  return (
    <div className={cn("flex h-screen w-20 flex-col items-center gap-4 border-r border-border bg-card py-6 shadow-flat",className)}>
      <div className="mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-flat">
          QG
        </div>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {filteredNav.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-xl transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-flat"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              title={item.name}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name.split(" ")[0]}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={logout}
        className="flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        title="Cerrar Sesión"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-[10px] font-medium">Salir</span>
      </button>
    </div>
  )
}
