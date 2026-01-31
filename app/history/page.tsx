"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { usePOSStore } from "@/lib/store";
import type { CompletedOrder } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { HistoryTable } from "@/components/HistoryTable";
import { HistoryDetailModal } from "@/components/HistoryDetailModal";
import { HistoryCards } from "@/components/HistoryCards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, History, TrendingUp, Hash, FileDown, ReceiptText, LayoutGrid, Table as TableIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Componente de tarjeta de resumen, similar al de ReportsPage para consistencia
const StatCard = ({ icon: Icon, title, value, subtext }: { icon: React.ElementType, title: string, value: string, subtext: string }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    className="bg-white border border-[#FFE0C2] rounded-xl shadow-sm p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <p className="text-base font-semibold text-[#A65F33]/80">{title}</p>
      <Icon className="h-6 w-6 text-[#FFA142]" />
    </div>
    <div>
      <p className="text-4xl font-bold text-[#A65F33]">{value}</p>
      <p className="text-sm text-[#A65F33]/70">{subtext}</p>
    </div>
  </motion.div>
);


export default function HistoryPage() {
  const router = useRouter();
  const { currentUser, orderHistory } = usePOSStore();

  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Mobile sidebar handlers
  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    if (!currentUser) router.push("/");
  }, [currentUser, router]);

  // Filtra los pedidos basándose en la fecha y el término de búsqueda
  const filteredOrders = useMemo(() => {
    return orderHistory.filter((order) => {
      const orderDate = new Date(order.completionTime);
      const isSameDay = selectedDate ? orderDate.toDateString() === selectedDate.toDateString() : true;

      const searchMatch = searchTerm.toLowerCase() === '' ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tableNumber.toString().includes(searchTerm) ||
        order.waiter?.toLowerCase().includes(searchTerm.toLowerCase());

      return isSameDay && searchMatch;
    });
  }, [orderHistory, selectedDate, searchTerm]);

  // Calcula las estadísticas basadas en los pedidos filtrados
  const stats = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    return { totalSales, totalOrders, averageTicket };
  }, [filteredOrders]);

  if (!currentUser) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="flex h-screen bg-[#FFF5ED]"> {/* Fondo: Crema de Fondo */}
      <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={handleMobileSidebarClose} />
      <div className="flex flex-1 flex-col">
        <Header onMobileMenuToggle={handleMobileMenuToggle} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-7xl mx-auto"
          >
            {/* Cabecera de la página */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-8">
              <div className="flex items-center gap-3">
                <History className="h-8 w-8 text-[#A65F33]" />
                <div>
                  <h2 className="text-3xl font-bold text-[#A65F33]">Historial de Ventas</h2>
                  <p className="text-base text-[#A65F33]/70">Explora y filtra todas las transacciones completadas.</p>
                </div>
              </div>
            </motion.div>

            {/* Tarjetas de Estadísticas (Solo visibles para no mozos) */}
            {currentUser.role !== "waiter" && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <StatCard icon={TrendingUp} title="Ventas Totales" value={`S/ ${stats.totalSales.toFixed(2)}`} subtext="Ingresos del día" />
                <StatCard icon={ReceiptText} title="Pedidos Completados" value={stats.totalOrders.toString()} subtext="Transacciones del día" />
                <StatCard icon={Hash} title="Ticket Promedio" value={`S/ ${stats.averageTicket.toFixed(2)}`} subtext="Valor por pedido" />
              </div>
            )}

            {/* Controles de la Tabla */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-[#FFF3E5] border border-[#FFE0C2] rounded-xl">
              <Input
                placeholder="Buscar por ID, mesa o mesero..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-[#FFE0C2] bg-white text-[#A65F33] focus:border-[#FFA142] focus:ring-[#FFA142]/50"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal border-[#FFE0C2] bg-white text-[#A65F33] hover:bg-[#F4EFDF]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
              <Button className="w-full md:w-auto bg-[#A65F33] text-white hover:bg-[#A65F33]/90">
                <FileDown className="mr-2 h-4 w-4" /> Exportar a CSV
              </Button>

              {/* Toggle de Vista */}
              <div className="flex bg-white rounded-lg border border-[#FFE0C2] p-1 h-10 w-full md:w-auto">
                <button
                  onClick={() => setViewMode("cards")}
                  className={cn(
                    "flex-1 md:w-10 flex items-center justify-center rounded-md transition-all",
                    viewMode === "cards" ? "bg-[#FFA142] text-white shadow-sm" : "text-[#A65F33]/50 hover:bg-[#FFF5ED]"
                  )}
                  title="Vista de Tarjetas"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "flex-1 md:w-10 flex items-center justify-center rounded-md transition-all",
                    viewMode === "table" ? "bg-[#FFA142] text-white shadow-sm" : "text-[#A65F33]/50 hover:bg-[#FFF5ED]"
                  )}
                  title="Vista de Tabla"
                >
                  <TableIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            {/* Contenedor de datos (Cards o Tabla) */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              {viewMode === "cards" ? (
                <HistoryCards orders={filteredOrders} onCardClick={setSelectedOrder} />
              ) : (
                <HistoryTable orders={filteredOrders} onRowClick={setSelectedOrder} />
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>

      <HistoryDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div >
  );
}