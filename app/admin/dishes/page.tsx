"use client";

import { useState } from "react";
import { usePOSStore, MenuItem, Site } from "@/lib/store";
import { DishFormModal } from "@/components/dish-form-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    UtensilsCrossed, Plus, Search, Filter, Trash2, Edit, LayoutGrid, List, CheckCircle2, XCircle,
    Utensils, CupSoda, IceCream, Salad, Flame, Beef, Soup, Wine, GlassWater, Beer, ConciergeBell // Expanded Icons
} from "lucide-react";
import { JSX } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

const categoryThemes: Record<string, { icon: any, color: string, bg: string, border: string, shadow: string }> = {
    "all": { icon: LayoutGrid, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", shadow: "shadow-slate-100" },
    "Entradas": { icon: Salad, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", shadow: "shadow-emerald-100" },
    "Fondos": { icon: Utensils, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", shadow: "shadow-orange-100" },
    "Pollos a la brasa": { icon: Flame, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", shadow: "shadow-amber-100" },
    "Parrillas": { icon: Beef, color: "text-red-700", bg: "bg-red-50", border: "border-red-200", shadow: "shadow-red-100" },
    "Chaufas": { icon: Flame, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", shadow: "shadow-orange-100" },
    "Segundos": { icon: ConciergeBell, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", shadow: "shadow-blue-100" },
    "Sopas": { icon: Soup, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", shadow: "shadow-yellow-100" },
    "Bebidas": { icon: CupSoda, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", shadow: "shadow-cyan-100" },
    "Gaseosas": { icon: GlassWater, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", shadow: "shadow-sky-100" },
    "Licores": { icon: Wine, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", shadow: "shadow-purple-100" },
    "Postres": { icon: IceCream, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200", shadow: "shadow-pink-100" }
};

export default function AdminDishesPage() {
    const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = usePOSStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterSite, setFilterSite] = useState<Site | "all">("all");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState<MenuItem | undefined>(undefined);

    // Derived State
    const categories = Array.from(new Set(menuItems.map(item => item.category))).sort();

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || item.category === filterCategory;
        const matchesSite = filterSite === "all" || (item.sites && item.sites.includes(filterSite as Site));

        return matchesSearch && matchesCategory && matchesSite;
    });

    // Handlers
    const handleAddDish = (dishData: Omit<MenuItem, "id">) => {
        addMenuItem(dishData);
        setIsModalOpen(false);
    };

    const handleUpdateDish = (dishData: Omit<MenuItem, "id">) => {
        if (selectedDish) {
            updateMenuItem(selectedDish.id, dishData);
            setIsModalOpen(false);
            setSelectedDish(undefined);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("¿Estás seguro de eliminar este plato? Esta acción no se puede deshacer.")) {
            deleteMenuItem(id);
        }
    };

    const openEditModal = (dish: MenuItem) => {
        setSelectedDish(dish);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setSelectedDish(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-[#FFF5ED]">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {/* Header Page Content */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-[#A65F33] flex items-center gap-2">
                                <UtensilsCrossed className="h-8 w-8" />
                                Gestión de Platos
                            </h1>
                            <p className="text-[#A65F33]/70 mt-1">
                                Administra el catálogo, precios y disponibilidad por sede.
                            </p>
                        </div>
                        <Button onClick={openCreateModal} className="bg-[#FFA142] hover:bg-[#FFB167] text-white shadow-lg shadow-orange-200">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Plato
                        </Button>
                    </div>

                    {/* Category Cards Filter */}
                    <div className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {["all", ...categories].map((category) => {
                            const isAll = category === "all";
                            const categoryName = isAll ? "Todos" : category;
                            const relevantItems = isAll ? menuItems : menuItems.filter(i => i.category === category);
                            const count = relevantItems.length;
                            const isActive = filterCategory === category;

                            // Get Theme or Default
                            const theme = categoryThemes[category] || { icon: UtensilsCrossed, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", shadow: "shadow-gray-100" };
                            const Icon = theme.icon;

                            return (
                                <motion.button
                                    key={category}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setFilterCategory(category)}
                                    className={cn(
                                        "relative flex flex-col items-start p-3 rounded-xl border transition-all duration-300 group overflow-hidden",
                                        isActive
                                            ? cn("bg-white shadow-lg ring-1 ring-offset-2", theme.border.replace('border-', 'ring-'), theme.shadow)
                                            : "bg-white border-transparent hover:border-gray-200 hover:shadow-md"
                                    )}
                                    style={isActive ? { borderColor: 'transparent' } : {}}
                                >
                                    {/* Active Indicator Background with Gradient */}
                                    {isActive && (
                                        <div className={cn("absolute inset-0 rounded-xl opacity-10 bg-gradient-to-br from-white via-transparent to-current", theme.color)} />
                                    )}

                                    <div className={cn(
                                        "p-2.5 rounded-lg mb-2 transition-all duration-300 relative z-10",
                                        isActive ? theme.bg : "bg-gray-50 group-hover:bg-gray-100",
                                        "group-hover:shadow-sm"
                                    )}>
                                        <motion.div
                                            animate={isActive ? { rotate: [0, -10, 10, 0] } : {}}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        >
                                            <Icon size={24} className={cn("transition-colors duration-300", isActive ? theme.color : "text-gray-400 group-hover:text-gray-600")} />
                                        </motion.div>
                                    </div>

                                    <div className="relative z-10">
                                        <span className={cn("font-bold text-sm block leading-tight transition-colors", isActive ? "text-gray-900" : "text-gray-600 group-hover:text-gray-800")}>
                                            {categoryName}
                                        </span>
                                        <span className={cn("text-[10px] font-semibold mt-1 block transition-colors", isActive ? theme.color : "text-gray-400 group-hover:text-gray-500")}>
                                            {count} items
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Toolbar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-[#FFE0C2] mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex flex-1 gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar plato..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 border-[#FFE0C2] focus:ring-[#FFA142]"
                                />
                            </div>

                            <Select value={filterSite} onValueChange={(v) => setFilterSite(v as Site | "all")}>
                                <SelectTrigger className="w-[180px] border-[#FFE0C2]">
                                    <SelectValue placeholder="Sede" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las Sedes</SelectItem>
                                    <SelectItem value="polleria">Solo Pollería</SelectItem>
                                    <SelectItem value="restaurante">Solo Restaurante</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex bg-[#F4EFDF] p-1 rounded-lg border border-[#FFE0C2]">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn("p-2 rounded-md transition-all", viewMode === "grid" ? "bg-white shadow text-[#FFA142]" : "text-[#A65F33]/60")}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={cn("p-2 rounded-md transition-all", viewMode === "table" ? "bg-white shadow text-[#FFA142]" : "text-[#A65F33]/60")}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {filteredItems.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-20 text-[#A65F33]/50"
                            >
                                <UtensilsCrossed className="mx-auto h-16 w-16 mb-4 opacity-20" />
                                <p className="text-lg">No se encontraron platos con los filtros seleccionados.</p>
                            </motion.div>
                        ) : viewMode === "grid" ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                {filteredItems.map(item => (
                                    <DishCard
                                        key={item.id}
                                        item={item}
                                        onEdit={() => openEditModal(item)}
                                        onDelete={() => handleDelete(item.id)}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="table"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="bg-white rounded-xl shadow-sm border border-[#FFE0C2] overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-[#FFF5ED] text-[#A65F33]">
                                            <tr>
                                                <th className="px-6 py-3">Nombre</th>
                                                <th className="px-6 py-3">Categoría</th>
                                                <th className="px-6 py-3">Precio</th>
                                                <th className="px-6 py-3 text-center">Sedes</th>
                                                <th className="px-6 py-3 text-center">Estado</th>
                                                <th className="px-6 py-3 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.map((item) => (
                                                <tr key={item.id} className="border-b border-gray-100 hover:bg-[#FFFDF9]">
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("p-2 rounded-full", categoryThemes[item.category]?.bg || "bg-orange-50")}>
                                                                {(() => {
                                                                    const Icon = categoryThemes[item.category]?.icon || UtensilsCrossed;
                                                                    return <Icon size={18} className={categoryThemes[item.category]?.color || "text-orange-600"} />;
                                                                })()}
                                                            </div>
                                                            {item.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        <span className={cn("px-2 py-1 rounded text-xs font-bold", categoryThemes[item.category]?.bg || "bg-orange-50", categoryThemes[item.category]?.color || "text-orange-700")}>
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-[#A65F33]">S/ {item.price.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-1">
                                                            {item.sites.includes("polleria") && <span className="bg-yellow-100 text-yellow-800 px-1.5 rounded text-[10px] font-bold">POLL</span>}
                                                            {item.sites.includes("restaurante") && <span className="bg-blue-100 text-blue-800 px-1.5 rounded text-[10px] font-bold">REST</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {item.available ? (
                                                            <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                                                                <CheckCircle2 size={12} /> Activo
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-1 rounded-full text-xs">
                                                                <XCircle size={12} /> Inactivo
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16} /></button>
                                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <DishFormModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={selectedDish ? handleUpdateDish : handleAddDish}
                dish={selectedDish}
            />
        </div>
    );
}

function DishCard({ item, onEdit, onDelete }: { item: MenuItem, onEdit: () => void, onDelete: () => void }) {
    const theme = categoryThemes[item.category] || { icon: UtensilsCrossed, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" };
    const ThemeIcon = theme.icon;

    return (
        <motion.div
            layout
            className="group relative bg-white rounded-xl border border-[#FFE0C2] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
        >
            <div className={cn("h-40 flex items-center justify-center relative transition-colors overflow-hidden", theme.bg)}>
                {item.image ? (
                    <div className="absolute inset-0">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('hidden'); // Hide parent div to fall back to icon
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                    </div>
                ) : null}

                {/* Icon Fallback (Shown if no image or image error - though error hiding is tricky here without state, simple fallback is usually fine) */}
                {(!item.image) && (
                    <ThemeIcon className={cn("h-12 w-12 opacity-50 relative z-0", theme.color)} />
                )}

                <div className="absolute top-2 right-2 flex gap-1 z-10">
                    {item.sites.includes("polleria") && <span className="bg-yellow-100/90 backdrop-blur-sm text-yellow-800 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm">P</span>}
                    {item.sites.includes("restaurante") && <span className="bg-blue-100/90 backdrop-blur-sm text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm">R</span>}
                </div>

                <div className="absolute bottom-2 left-2 z-10">
                    <span className={cn("backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold border shadow-sm",
                        item.image ? "bg-black/40 text-white border-white/20" : cn(theme.bg, theme.color, theme.border)
                    )}>
                        {item.category}
                    </span>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 leading-tight line-clamp-2">{item.name}</h3>
                </div>

                <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-100">
                    <span className="text-xl font-bold text-[#FFA142]">S/ {item.price.toFixed(2)}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100"><Edit size={16} /></button>
                        <button onClick={onDelete} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
