"use client"

import { useEffect } from "react"
import { usePOSStore } from "@/lib/store"
import { X, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotificationToast() {
  const { notifications, removeNotification } = usePOSStore()

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notifications, removeNotification])

  if (notifications.length === 0) return null

  const notification = notifications[0]

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    info: <Info className="h-5 w-5 text-blue-info" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-flat-lg border border-border min-w-[320px]">
        {icons[notification.type]}
        <p className="flex-1 text-sm font-medium text-foreground">{notification.message}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeNotification(notification.id)}
          className="h-6 w-6 rounded-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
