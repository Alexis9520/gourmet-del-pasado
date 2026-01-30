"use client";

import { useDraggable } from "@dnd-kit/core";
import { MenuItem } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Search, Utensils, Flame, Beer, IceCream, Plus, Coffee, Pizza, Soup, Wine, HandPlatter, Building2, Store } from "lucide-react";

export function DishSource({ menuItems, onAddItem }: { menuItems: MenuItem[], onAddItem: (item: MenuItem) => void }) {
    const [filter, setFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [siteFilter, setSiteFilter] = useState<"all" | "polleria" | "restaurante">("all");

    // Get categories based on current items (which might be filtered by site later)
    // Ideally, categories should be derived from the *filtered by site* items to avoid empty categories
    const filteredBySite = menuItems.filter(item =>
        siteFilter === "all" || item.sites.includes(siteFilter)
    );

    const categories = ["all", ...Array.from(new Set(filteredBySite.map((i) => i.category)))];

    const filteredItems = filteredBySite.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(filter.toLowerCase());
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-xl border border-white shadow-xl overflow-hidden ring-1 ring-orange-100">
            <div className="p-4 bg-gradient-to-b from-orange-50/80 to-transparent">
                <h3 className="font-bold text-lg text-orange-900 mb-3 flex items-center gap-2">
                    <Utensils size={18} className="text-orange-500" />
                    <span>Catálogo de Platos</span>
                    <span className="text-xs ml-auto bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">{filteredItems.length}</span>
                </h3>

                <div className="space-y-3">
                    {/* Site Filter Tabs */}
                    <div className="flex bg-white/50 p-1 rounded-lg border border-orange-100/50">
                        <button
                            onClick={() => setSiteFilter("all")}
                            className={cn(
                                "flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                siteFilter === "all" ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-orange-500 hover:bg-white/30"
                            )}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setSiteFilter("polleria")}
                            className={cn(
                                "flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                siteFilter === "polleria" ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-orange-500 hover:bg-white/30"
                            )}
                        >
                            <Flame size={12} /> Pollería
                        </button>
                        <button
                            onClick={() => setSiteFilter("restaurante")}
                            className={cn(
                                "flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                siteFilter === "restaurante" ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-orange-500 hover:bg-white/30"
                            )}
                        >
                            <Utensils size={12} /> Restaurante
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300 w-4 h-4 transition-colors group-focus-within:text-orange-500" />
                        <input
                            type="text"
                            placeholder="Buscar plato..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400/50 bg-white/50 focus:bg-white transition-all shadow-sm"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                        {categories.map(c => (
                            <button
                                key={c}
                                onClick={() => setCategoryFilter(c)}
                                className={cn(
                                    "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm border",
                                    categoryFilter === c
                                        ? "bg-orange-500 text-white border-orange-600 shadow-orange-200"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-200 hover:text-orange-600"
                                )}
                            >
                                {c === "all" ? "Todos" : c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
                {filteredItems.map((item) => (
                    <DraggableDish key={item.id} item={item} onAdd={() => onAddItem(item)} />
                ))}
                {filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                        <Search size={32} className="opacity-20" />
                        <p className="text-sm">No se encontraron platos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DraggableDish({ item, onAdd }: { item: MenuItem, onAdd: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
        data: item,
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "group relative p-3 bg-white rounded-xl border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-orange-200 touch-none", // Added touch-none to prevent scroll interference
                isDragging ? "opacity-30 grayscale" : "hover:-translate-y-0.5"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center transition-colors overflow-hidden shrink-0",
                        "bg-orange-50 text-orange-500 group-hover:bg-orange-100 group-hover:text-orange-600"
                    )}>
                        {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            getCategoryIcon(item.category)
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight group-hover:text-orange-900 transition-colors line-clamp-2">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">{item.category}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="font-bold text-orange-500 text-sm">S/ {item.price.toFixed(2)}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                        className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 hover:bg-orange-200"
                    >
                        <Plus size={10} /> Añadir
                    </button>
                </div>
            </div>

            {/* Site Indicators */}
            <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.sites.map(s => (
                    <div key={s} className={`w-1.5 h-1.5 rounded-full ${s === 'polleria' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                ))}
            </div>
        </div>
    );
}

function getCategoryIcon(category: string) {
    const c = category.toLowerCase();
    if (c.includes("pollo") || c.includes("brasa")) return <Flame size={18} />;
    if (c.includes("parrilla")) return <Utensils size={18} />;
    if (c.includes("bebida") || c.includes("gaseosa")) return <Beer size={18} />; // Generic drink
    if (c.includes("licor") || c.includes("vino")) return <Wine size={18} />;
    if (c.includes("postre") || c.includes("helado")) return <IceCream size={18} />;
    if (c.includes("sopa") || c.includes("caldo")) return <Soup size={18} />;
    if (c.includes("chaufa")) return <HandPlatter size={18} />; // Rice icon replacement
    if (c.includes("café")) return <Coffee size={18} />;
    if (c.includes("pizza")) return <Pizza size={18} />;
    return <Utensils size={18} />;
}
