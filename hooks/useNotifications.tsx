// src/hooks/useNotifications.ts

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { usePOSStore } from "@/lib/store";
import type { Notification } from "@/lib/store"; // ✅ 1. Importamos el tipo 'Notification'
import CustomToast from "@/components/CustomToast";

export function useNotifications() {
  const notifications = usePOSStore((state) => state.notifications);
  const removeNotification = usePOSStore((state) => state.removeNotification);
  
  // ✅ 2. Tipamos explícitamente el Set para que contenga strings
  const processedIds = useRef(new Set<string>());

  useEffect(() => {
    // ✅ 3. Tipamos el parámetro 'notification'
    notifications.forEach((notification: Notification) => {
      // Si la notificación no ha sido procesada aún, muéstrala.
      if (!processedIds.current.has(notification.id)) {
        toast.custom(
          (t) => (
            <CustomToast
              t={t}
              id={notification.id}
              type={notification.type}
              message={notification.message}
              onDismiss={() => {
                // El toast se cierra, así que lo eliminamos del store
                removeNotification(notification.id);
                // NOTA: No es necesario eliminar de processedIds.current aquí.
                // De hecho, es mejor no hacerlo para evitar que un toast que se está cerrando
                // sea renderizado de nuevo si el estado cambia rápidamente.
                // El Set se reiniciará solo si el componente se desmonta.
              }}
            />
          ),
          { id: notification.id, duration: 5000 } // Duración para el auto-cierre
        );
        processedIds.current.add(notification.id);
      }
    });

    // Limpieza: Sincronizar los IDs procesados con las notificaciones reales
    const notificationIds = new Set(notifications.map(n => n.id));
    processedIds.current.forEach(id => {
      if (!notificationIds.has(id)) {
        processedIds.current.delete(id);
      }
    });

  }, [notifications, removeNotification]);
}