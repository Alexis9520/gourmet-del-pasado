"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MenuBuilder } from "@/components/menu-builder/MenuBuilder";
import { usePOSStore, Menu } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit2, Trash2, CheckCircle, XCircle, Copy, ChevronRight, LayoutDashboard, Clock, Power, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function MenusPage() {
    const { menus, addMenu, deleteMenu, updateMenu, addNotification } = usePOSStore();
    const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    // Mobile sidebar handlers
    const handleMobileMenuToggle = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleMobileSidebarClose = () => {
        setIsMobileSidebarOpen(false);
    };

    // Form State
    const [menuForm, setMenuForm] = useState<{ name: string; type: "daily" | "weekly" | "special" }>({
        name: "",
        type: "daily"
    });

    const handleCreateMenu = () => {
        if (!menuForm.name || !menuForm.name.trim()) {
            addNotification({ message: "Por favor ingresa un nombre para el menú.", type: "warning" });
            return;
        }

        addMenu({
            name: menuForm.name.trim(),
            type: menuForm.type,
            isActive: false,
            items: [],
            weeklyItems: {}, // Initialize for weekly menus
            startDate: new Date().toISOString(),
        });
        setIsModalOpen(false);
        setMenuForm({ name: "", type: "daily" });
    };

    const handleDeleteMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("¿Estás seguro de eliminar este menú?")) return;
        try {
            deleteMenu(id);
            if (selectedMenuId === id) setSelectedMenuId(null);
            addNotification({ message: "Menú eliminado.", type: "success" });
        } catch (err) {
            console.error("Error eliminando menú:", err);
            addNotification({ message: "No se pudo eliminar el menú.", type: "warning" });
        }
    };

    const toggleActivation = (id: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        updateMenu(id, { isActive: !currentStatus });
    }

    return (
        <div className="flex h-screen bg-[#FFF5ED] overflow-hidden">
            <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={handleMobileSidebarClose} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header onMobileMenuToggle={handleMobileMenuToggle} />

                <main className="flex-1 p-6 overflow-hidden flex flex-col relative z-0">
                    {/* Background Grid Accent */}
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#FA8C16 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    <div className="flex justify-between items-end mb-6 relative z-10">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#A65F33] tracking-tight">Gestión de Menús</h1>
                            <p className="text-[#A65F33]/60 font-medium">Diseña y organiza la oferta gastronómica.</p>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden relative z-10">
                        {/* Sidebar de Menús (Lista) */}
                        <div className="w-full lg:w-1/3 bg-white/60 backdrop-blur-xl rounded-2xl border border-white shadow-xl flex flex-col h-full overflow-hidden transition-all">
                            <div className="p-5 border-b border-orange-100/50 bg-gradient-to-r from-white to-orange-50/30 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-orange-900 flex items-center gap-2">
                                    <LayoutDashboard size={20} className="text-orange-500" /> Mis Menús
                                </h3>
                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    size="sm"
                                    className="bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700 border border-orange-200 shdow-sm h-8 px-3 rounded-full text-xs font-bold"
                                >
                                    <Plus className="mr-1 h-3 w-3" /> Nuevo
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {menus.length === 0 ? (
                                    <div className="text-center py-12 px-6">
                                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar size={24} className="text-orange-300" />
                                        </div>
                                        <h4 className="text-gray-600 font-semibold mb-1">Sin menús</h4>
                                        <p className="text-xs text-gray-400">Crea tu primer menú para comenzar.</p>
                                    </div>
                                ) : (
                                    menus.map((menu, idx) => {
                                            const colorClasses = selectedMenuId === menu.id
                                                ? "bg-gradient-to-br from-orange-500 to-orange-600 border-transparent shadow-lg shadow-orange-500/30 text-white"
                                                : (menu.type === 'weekly'
                                                    ? "bg-purple-50 border-purple-100 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 text-purple-800"
                                                    : menu.type === 'daily'
                                                        ? "bg-yellow-50 border-yellow-100 hover:border-yellow-300 hover:shadow-md hover:-translate-y-0.5 text-yellow-800"
                                                        : "bg-rose-50 border-rose-100 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5 text-rose-800"
                                                );

                                            const TypeIcon = menu.type === 'weekly' ? Calendar : menu.type === 'daily' ? Clock : Star;

                                            return (
                                                <motion.div
                                                    key={menu.id}
                                                    layout
                                                    onClick={() => setSelectedMenuId(menu.id)}
                                                    whileHover={{ scale: 1.02, y: -4 }}
                                                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                                    className={cn(
                                                        "p-4 rounded-xl border cursor-pointer transition-all duration-300 group relative overflow-hidden",
                                                        colorClasses
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start mb-1 relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shadow-sm", selectedMenuId === menu.id ? "bg-white/20" : "bg-white/90")}> 
                                                                <TypeIcon size={16} className={selectedMenuId === menu.id ? "text-white" : "text-current"} />
                                                            </div>
                                                            <h4 className={cn("font-bold text-base tracking-tight", selectedMenuId === menu.id ? "text-white" : "text-gray-800")}>
                                                                {menu.name}
                                                            </h4>
                                                        </div>
                                                        <button
                                                            onClick={(e) => toggleActivation(menu.id, menu.isActive, e)}
                                                            className={cn(
                                                                "p-1.5 rounded-full transition-colors flex items-center justify-center",
                                                                selectedMenuId === menu.id
                                                                    ? "bg-white/20 text-white hover:bg-white/30"
                                                                    : (menu.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400 hover:bg-gray-200")
                                                            )}
                                                            title={menu.isActive ? "Desactivar" : "Activar"}
                                                        >
                                                            <Power size={14} className={menu.isActive ? "text-green-600" : "text-gray-400"} />
                                                        </button>
                                                    </div>

                                                    <div className={cn("flex items-center gap-3 text-xs mb-3 relative z-10", selectedMenuId === menu.id ? "text-orange-100" : "text-gray-500")}>
                                                        <span className="flex items-center gap-1 opacity-90">
                                                            <Clock size={12} /> {menu.type === 'daily' ? 'Diario' : menu.type === 'weekly' ? 'Semanal' : 'Especial'}
                                                        </span>
                                                        <span className="opacity-60">•</span>
                                                        <span className="opacity-90">{menu.items.length} platos</span>
                                                        {menu.startDate && (
                                                            <>
                                                                <span className="opacity-60">•</span>
                                                                <span className="opacity-90">Creado: {new Date(menu.startDate).toLocaleDateString('es-PE')}</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Status Badge & Week Indicator */}
                                                    <div className="flex items-center gap-2 relative z-10 mt-2">
                                                        <div className={cn(
                                                            "inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                                            selectedMenuId === menu.id
                                                                ? (menu.isActive ? "bg-white text-green-600" : "bg-black/20 text-white")
                                                                : (menu.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")
                                                        )}>
                                                            {menu.isActive ? "Activo" : "Inactivo"}
                                                        </div>

                                                        {menu.type === 'weekly' && (
                                                            <span className={cn(
                                                                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                                                selectedMenuId === menu.id ? "border-white/30 text-white" : "border-purple-200 text-purple-600 bg-purple-50"
                                                            )}>
                                                                📅 Semanal
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Decorative Circle */}
                                                    {selectedMenuId === menu.id && (
                                                        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
                                                    )}

                                                    {/* Action Buttons (Visible on Hover/Selected) */}
                                                    {(selectedMenuId === menu.id || true) && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className={cn(
                                                                "absolute bottom-3 right-3 flex gap-2 transition-opacity duration-200",
                                                                selectedMenuId === menu.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                            )}
                                                        >
                                                            <button
                                                                className={cn(
                                                                    "p-1.5 rounded-lg transition-colors",
                                                                    selectedMenuId === menu.id ? "text-white/80 hover:bg-white/20 hover:text-white" : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                                )}
                                                                onClick={(e) => handleDeleteMenu(menu.id, e)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                            <button
                                                                className={cn(
                                                                    "p-1.5 rounded-lg transition-colors",
                                                                    selectedMenuId === menu.id ? "text-white/80 hover:bg-white/20 hover:text-white" : "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                                                                )}
                                                            >
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )
                                        })
                                )}
                            </div>
                        </div>

                        {/* Area Principal (Builder) */}
                        <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                            <MenuBuilder menuId={selectedMenuId} />
                        </div>
                    </div>
                </main>

                {/* Create Menu Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px] border-0 bg-white shadow-2xl rounded-2xl">
                        <DialogHeader className="bg-orange-50/50 p-6 rounded-t-2xl border-b border-orange-100">
                            <DialogTitle className="text-2xl font-bold text-orange-900">Crear Nuevo Menú</DialogTitle>
                            <p className="text-orange-800/60 text-sm">Configura los detalles básicos de tu menú.</p>
                        </DialogHeader>
                        <div className="grid gap-6 py-6 px-6">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => setMenuForm({ ...menuForm, name: `Menú ${day}` })}
                                        className="px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-orange-100 text-gray-700"
                                    >
                                        {day}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setMenuForm({ ...menuForm, name: "" })}
                                    className="px-3 py-1 rounded-full text-sm text-gray-500"
                                >
                                    Borrar
                                </button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700 font-semibold">Nombre del Menú</Label>
                                <Input
                                    id="name"
                                    className="border-gray-200 focus:ring-orange-500 focus:border-orange-500 bg-gray-50/50"
                                    placeholder="Ej: Menú Ejecutivo Lunes"
                                    value={menuForm.name}
                                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-gray-700 font-semibold">Tipo de Frecuencia</Label>
                                <Select
                                    value={menuForm.type}
                                    onValueChange={(v: any) => setMenuForm({ ...menuForm, type: v })}
                                >
                                    <SelectTrigger className="border-gray-200 bg-gray-50/50">
                                        <SelectValue placeholder="Selecciona tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Diario (Recurrente)</SelectItem>
                                        <SelectItem value="weekly">Semanal (Bloque)</SelectItem>
                                        <SelectItem value="special">Evento Especial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="p-6 pt-2">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">Cancelar</Button>
                            <Button
                                onClick={handleCreateMenu}
                                disabled={menuForm.name.trim() === ""}
                                className={menuForm.name.trim() === "" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 px-8 opacity-50 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 px-8"}
                            >
                                Crear Menú
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
