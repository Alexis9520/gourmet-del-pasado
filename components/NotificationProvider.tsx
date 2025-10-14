// src/components/NotificationProvider.tsx

"use client"; // Este componente debe ser un Componente de Cliente

import { Toaster } from "react-hot-toast";
import { useNotifications } from "@/hooks/useNotifications"; // Importamos nuestro hook

export default function NotificationProvider() {
  // 1. Esta línea es el "motor" que escucha y crea los toasts. ¡Es la más importante!
  useNotifications();

  // 2. Esta línea es el "escenario" donde los toasts aparecen.
  return <Toaster position="top-center" />;
}