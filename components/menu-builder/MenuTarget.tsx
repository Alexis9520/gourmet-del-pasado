"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuItem, Menu } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Trash2, GripVertical, Calendar, Clock, ArrowDownCircle, Coins, ListOrdered, BarChart3, Eraser, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export function MenuTarget({
    menu,
    menuDishes,
    isPlaceholder,
    onRemoveItem,
    onSave
}: {
    menu: Menu | { id: string, name: string, items: string[], isActive: boolean };
    menuDishes: MenuItem[];
    isPlaceholder: boolean;
    onRemoveItem: (id: string) => void;
    onSave: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: "menu-droppable",
    });

    const totalCost = menuDishes.reduce((acc, curr) => acc + curr.price, 0);
    const avgPrice = menuDishes.length > 0 ? totalCost / menuDishes.length : 0;

    return (
        <div className={cn(
            "flex flex-col h-full rounded-xl border transition-all duration-300 overflow-hidden relative",
            isOver ? "border-orange-400 bg-orange-50/50 shadow-[0_0_30px_-5px_rgba(251,146,60,0.3)] ring-2 ring-orange-200" : "border-white bg-white/70 backdrop-blur-md shadow-xl"
        )}>
            {/* Header del Menú */}
            <div className="p-6 border-b border-orange-100/50 bg-gradient-to-r from-white to-orange-50/30">
                {isPlaceholder ? (
                    <div className="text-center py-8 opacity-50 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4 animate-pulse">
                            <ArrowDownCircle size={32} className="text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">Selecciona o crea un menú</h3>
                        <p className="text-sm text-gray-400 mt-2">Para comenzar a agregar platos.</p>
                    </div>
                ) : (
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold tracking-wider text-orange-500 uppercase bg-orange-100 px-2 py-0.5 rounded-full ring-1 ring-orange-200">
                                    Editando
                                </span>
                                {menu.isActive && (
                                    <span className="text-[10px] font-bold tracking-wider text-green-600 uppercase bg-green-100 px-2 py-0.5 rounded-full ring-1 ring-green-200 animate-pulse">
                                        En Vivo
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{menu.name}</h2>

                            <div className="flex gap-4 text-xs font-semibold text-gray-500 mt-3">
                                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                    <Calendar size={14} className="text-orange-400" />
                                    <span>Lunes - Viernes</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                    <Clock size={14} className="text-orange-400" />
                                    <span>12:00 PM - 4:00 PM</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={onSave} size="sm" className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white shadow-sm">
                                <Save size={14} className="mr-1.5" /> Guardar
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs border-orange-200 text-orange-700 hover:bg-orange-50">
                                <Eraser size={14} className="mr-1.5" /> Limpiar
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Zona de Drop */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-4 overflow-y-auto transition-colors scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent",
                    isOver ? "bg-orange-50/80" : "bg-slate-50/50"
                )}
            >
                <SortableContext
                    items={menu.items}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3 min-h-[100px] h-full">
                        {menuDishes.map((item) => (
                            <SortableMenuItem key={item.id} id={item.id} item={item} onRemove={() => onRemoveItem(item.id)} />
                        ))}

                        {menuDishes.length === 0 && !isPlaceholder && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl py-12 bg-gray-50/50">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                                    <ArrowDownCircle size={24} className="text-orange-300" />
                                </div>
                                <p className="font-medium">Arrastra platos aquí</p>
                                <p className="text-xs opacity-60 mt-1">Sueltalo para agregar al menú</p>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>

            {/* Footer con Resumen (Stats Dashboard) */}
            {!isPlaceholder && (
                <div className="bg-white border-t border-orange-100 p-4 grid grid-cols-3 divide-x divide-gray-100 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] relative z-10">
                    <div className="flex flex-col items-center justify-center px-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <ListOrdered size={12} /> Items
                        </span>
                        <span className="text-xl font-bold text-gray-800">{menuDishes.length}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Coins size={12} /> Costo Total
                        </span>
                        <span className="text-xl font-bold text-orange-500">S/ {totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <BarChart3 size={12} /> Promedio
                        </span>
                        <span className="text-xl font-bold text-gray-800">S/ {avgPrice.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function SortableMenuItem({ id, item, onRemove }: { id: string, item: MenuItem, onRemove: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:border-orange-200 hover:shadow-md hover:translate-x-1 relative overflow-hidden",
                isDragging ? "shadow-xl ring-2 ring-orange-400 rotate-1 z-50 bg-orange-50" : ""
            )}
        >
            {/* Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-200 group-hover:bg-orange-500 transition-colors" />

            <div className="flex items-center gap-3 pl-3">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-orange-500 p-1 rounded hover:bg-orange-50 transition-colors">
                    <GripVertical size={18} />
                </div>
                <div>
                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                    <div className="flex gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">{item.category}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="font-bold text-gray-700 text-sm">S/ {item.price.toFixed(2)}</span>
                <button
                    onClick={onRemove}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
