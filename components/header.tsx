"use client"

import { usePOSStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { currentUser } = usePOSStore()

  return (
    <header className={cn("flex h-16 items-center justify-between border-b border-border bg-card px-6", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold">
          QG
        </div>
        <h1 className="text-xl font-display font-bold text-foreground">Quantify Gourmet</h1>
      </div>

      {currentUser && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hola,</span>
          <span className="text-sm font-semibold text-foreground">{currentUser.name}</span>
        </div>
      )}
    </header>
  )
}
