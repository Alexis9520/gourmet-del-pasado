"use client";

import { useState, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    closestCenter,
    MouseSensor
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy
} from "@dnd-kit/sortable";
import { usePOSStore, MenuItem } from "@/lib/store";
import { DishSource } from "./DishSource";
import { MenuTarget } from "./MenuTarget";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { snapCenterToCursor } from "@dnd-kit/modifiers";

const DAYS_OF_WEEK = [
    { id: "monday", label: "Lunes" },
    { id: "tuesday", label: "Martes" },
    { id: "wednesday", label: "Miércoles" },
    { id: "thursday", label: "Jueves" },
    { id: "friday", label: "Viernes" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
];

export function MenuBuilder({ menuId }: { menuId: string | null }) {
    const { menuItems, menus, updateMenu, addMenu } = usePOSStore();
    const [selectedDay, setSelectedDay] = useState("monday");

    // Find current menu or create default structure
    const currentMenu = menus.find(m => m.id === menuId) || { id: "temp", items: [] as string[], weeklyItems: {}, name: "", isActive: false, type: "daily" };

    const isWeekly = currentMenu.type === "weekly";

    // Items logic: If weekly, get from weeklyItems[selectedDay], else from items
    const currentItemIds = isWeekly
        ? (currentMenu.weeklyItems?.[selectedDay] || [])
        : (currentMenu.items || []);

    const menuDishes = currentItemIds
        .map(id => menuItems.find(i => i.id === id))
        .filter((i): i is MenuItem => !!i);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Fix for SSR: Portal only works on client
    useEffect(() => {
        setMounted(true);
    }, []);

    // Configure sensors with minimal delay/distance for responsiveness
    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Require the mouse to move by 4 pixels before activating, for accidental clicks prevention but fast feel
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(TouchSensor, {
            // Require a small press delay for touch to separate scroll from drag, but keep it tight (100ms)
            activationConstraint: {
                delay: 100,
                tolerance: 5,
            },
        }),
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIdStr = active.id as string;

        // Use logic vars
        const currentItems = isWeekly
            ? (currentMenu.weeklyItems?.[selectedDay] || [])
            : (currentMenu.items || []);

        const isSourceItem = !currentItems.includes(activeIdStr);
        const isOverTarget = over.id === "menu-droppable" || currentItems.includes(over.id as string);

        if (menuId && isActiveMenu(menuId)) { // Only if editing a real menu
            if (isSourceItem && isOverTarget) {
                // Add to menu
                const newItems = [...currentItems, activeIdStr];
                updateStoreItems(newItems);

            } else if (!isSourceItem && isOverTarget && activeIdStr !== over.id) {
                // Reorder
                const oldIndex = currentItems.indexOf(activeIdStr);
                const newIndex = over.id === "menu-droppable" ? currentItems.length : currentItems.indexOf(over.id as string);
                const newItems = arrayMove(currentItems, oldIndex, newIndex);
                updateStoreItems(newItems);
            }
        }
    };

    const isActiveMenu = (id: string | null): id is string => {
        return !!id && id !== "temp";
    }

    const updateStoreItems = (newItems: string[]) => {
        if (!menuId) return;
        if (isWeekly) {
            const updatedWeeklyItems = { ...(currentMenu.weeklyItems || {}), [selectedDay]: newItems };
            updateMenu(menuId, { weeklyItems: updatedWeeklyItems });
        } else {
            updateMenu(menuId, { items: newItems });
        }
    }

    const handleAddItem = (item: MenuItem) => {
        if (!menuId || !isActiveMenu(menuId)) {
            toast.error("Selecciona un menú primero");
            return;
        }

        const currentItems = isWeekly
            ? (currentMenu.weeklyItems?.[selectedDay] || [])
            : (currentMenu.items || []);

        const newItems = [...currentItems, item.id];
        updateStoreItems(newItems);
        toast.success(`Añadido a ${isWeekly ? DAYS_OF_WEEK.find(d => d.id === selectedDay)?.label : 'Menú'}: ${item.name}`, { icon: '🥘' });
    }

    const handleRemoveItem = (itemId: string) => {
        if (!menuId || !isActiveMenu(menuId)) return;

        const currentItems = isWeekly
            ? (currentMenu.weeklyItems?.[selectedDay] || [])
            : (currentMenu.items || []);

        const newItems = currentItems.filter(id => id !== itemId);
        updateStoreItems(newItems);
    };

    const handleSave = () => {
        if (!menuId || !isActiveMenu(menuId)) return;
        toast.success("Menú guardado correctamente");
    };

    // Helper to get active item details for overlay
    const activeItem = menuItems.find(i => i.id === activeId);

    if (!mounted) return null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[snapCenterToCursor]} // Adds snap center behavior for better cursor alignment
        >
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
                {/* Target Panel (Center) */}
                <div className="flex-1 w-full lg:w-1/2 flex flex-col gap-4 items-center">

                    {/* Day Tabs for Weekly Menu */}
                    {isWeekly && (
                        <div className="flex overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide gap-2 w-full max-w-3xl">
                            {DAYS_OF_WEEK.map(day => (
                                <button
                                    key={day.id}
                                    onClick={() => setSelectedDay(day.id)}
                                    className={`
                                        flex-1 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
                                        ${selectedDay === day.id
                                            ? "bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-200 scale-105"
                                            : "bg-white text-gray-500 border-gray-100 hover:border-orange-200 hover:text-orange-500"
                                        }
                                    `}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden relative w-full flex justify-center">
                        {/* Visual overlay for current day context */}
                        {isWeekly && (
                            <div className="absolute top-2 right-4 z-10 opacity-10 pointer-events-none">
                                <span className="text-4xl font-black text-orange-900 uppercase tracking-tighter">
                                    {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.label}
                                </span>
                            </div>
                        )}

                        <div className="w-full max-w-3xl">
                            <MenuTarget
                                menu={currentMenu}
                                menuDishes={menuDishes}
                                isPlaceholder={!menuId}
                                onRemoveItem={handleRemoveItem}
                                onSave={handleSave}
                            />
                        </div>
                    </div>
                </div>

                {/* Source Panel (Right - Catalog) */}
                <div className="w-full lg:w-1/3 min-w-[260px]">
                    <DishSource menuItems={menuItems} onAddItem={handleAddItem} />
                </div>
            </div>

            {/* Drag Overlay with adjusted cursor style */}
            {createPortal(
                <DragOverlay dropAnimation={{
                    duration: 250,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {activeItem ? (
                        <div className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border-2 border-orange-400 w-[200px] cursor-grabbing transform scale-105">
                            <p className="font-bold text-gray-800">{activeItem.name}</p>
                            <p className="text-orange-500 font-bold">S/ {activeItem.price.toFixed(2)}</p>
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
