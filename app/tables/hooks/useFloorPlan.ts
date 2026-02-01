"use client";

import { useState, useCallback, useEffect } from "react";
import { FloorPlanObject, FloorPlanData, TableStatus, ObjectType, Position, TABLE_PRESETS, OBJECT_PRESETS } from "../types/floorplan";
import { SAMPLE_FLOOR_PLAN } from "../data/sample-floorplan";

const DEFAULT_FLOOR_PLAN: FloorPlanData = SAMPLE_FLOOR_PLAN;

export function useFloorPlan() {
  const [floorPlan, setFloorPlan] = useState<FloorPlanData>(DEFAULT_FLOOR_PLAN);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [scale, setScale] = useState(1);

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("floorPlan");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFloorPlan({ ...DEFAULT_FLOOR_PLAN, ...parsed });
      } catch (e) {
        console.error("Error loading floor plan:", e);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("floorPlan", JSON.stringify(floorPlan));
  }, [floorPlan]);

  const addObject = useCallback((type: ObjectType, position: Position, options?: Partial<FloorPlanObject>) => {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let newObject: FloorPlanObject;

    if (type === "table") {
      const shape = (options?.shape || "round") as keyof typeof TABLE_PRESETS;
      const preset = TABLE_PRESETS[shape];
      newObject = {
        id,
        type: "table",
        position,
        size: { width: preset.width, height: preset.height },
        shape,
        capacity: options?.capacity || 4,
        status: "available",
        label: options?.label || "Mesa",
        ...options,
      };
    } else {
      const preset = OBJECT_PRESETS[type];
      newObject = {
        id,
        type,
        position,
        size: { width: preset.width, height: preset.height },
        label: preset.label,
        color: preset.color,
        ...options,
      };
    }

    setFloorPlan((prev) => ({
      ...prev,
      objects: [...prev.objects, newObject],
    }));
    
    return id;
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<FloorPlanObject>) => {
    setFloorPlan((prev) => ({
      ...prev,
      objects: prev.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      ),
    }));
  }, []);

  const deleteObject = useCallback((id: string) => {
    setFloorPlan((prev) => ({
      ...prev,
      objects: prev.objects.filter((obj) => obj.id !== id && obj.parentId !== id),
    }));
    if (selectedObject === id) {
      setSelectedObject(null);
    }
  }, [selectedObject]);

  const moveObject = useCallback((id: string, position: Position) => {
    setFloorPlan((prev) => ({
      ...prev,
      objects: prev.objects.map((obj) => {
        if (obj.id === id) {
          return { ...obj, position };
        }
        // Mover sillas junto con la mesa
        if (obj.parentId === id) {
          const parent = prev.objects.find((o) => o.id === id);
          if (parent) {
            const dx = position.x - parent.position.x;
            const dy = position.y - parent.position.y;
            return {
              ...obj,
              position: {
                x: obj.position.x + dx,
                y: obj.position.y + dy,
              },
            };
          }
        }
        return obj;
      }),
    }));
  }, []);

  const updateTableStatus = useCallback((tableId: string, status: TableStatus) => {
    updateObject(tableId, { status });
  }, [updateObject]);

  const addChairsToTable = useCallback((tableId: string, count: number) => {
    const table = floorPlan.objects.find((o) => o.id === tableId);
    if (!table || table.type !== "table") return;

    const existingChairs = floorPlan.objects.filter(
      (o) => o.type === "chair" && o.parentId === tableId
    );

    // Eliminar sillas existentes
    const chairsToRemove = new Set(existingChairs.map((c) => c.id));
    
    // Calcular posiciones y rotaciones de sillas alrededor de la mesa
    const newChairs: FloorPlanObject[] = [];
    const padding = table.shape === "bar" ? 14 : 16;
    const radiusX = table.size.width / 2 + padding;
    const radiusY = table.size.height / 2 + padding;
    const centerX = table.position.x + table.size.width / 2;
    const centerY = table.position.y + table.size.height / 2;
    
    // Para mesas rectangulares, distribuir sillas de forma diferente
    const isRectangle = table.shape === "rectangle";
    const isBar = table.shape === "bar";
    
    for (let i = 0; i < count; i++) {
      let angle: number;
      let chairX: number;
      let chairY: number;
      let rotation: number;
      
      if (isBar) {
        // Para barra: sillas en línea, una a cada lado o todas abajo
        if (count <= 2) {
          // Una a cada lado
          angle = i === 0 ? 0 : Math.PI;
          chairX = centerX + (i === 0 ? radiusX : -radiusX) - 12;
          chairY = centerY - 12;
          rotation = i === 0 ? 90 : 270; // Miran hacia el centro
        } else {
          // Distribuidas a lo largo de la barra (abajo)
          const spacing = table.size.width / (count + 1);
          chairX = table.position.x + spacing * (i + 1) - 12;
          chairY = table.position.y + table.size.height + padding - 12;
          rotation = 180; // Todas miran hacia arriba
        }
      } else if (isRectangle && count >= 4) {
        // Para mesas rectangulares: sillas en los lados largos y cortos
        const longSideCount = Math.ceil(count / 2) - (count % 2 === 0 ? 0 : 1);
        const shortSideCount = Math.max(0, count - longSideCount * 2);
        
        if (i < longSideCount) {
          // Lado superior
          const spacing = table.size.width / (longSideCount + 1);
          chairX = table.position.x + spacing * (i + 1) - 12;
          chairY = table.position.y - padding - 12;
          rotation = 0; // Miran hacia abajo
        } else if (i < longSideCount * 2) {
          // Lado inferior
          const idx = i - longSideCount;
          const spacing = table.size.width / (longSideCount + 1);
          chairX = table.position.x + spacing * (idx + 1) - 12;
          chairY = table.position.y + table.size.height + padding - 12;
          rotation = 180; // Miran hacia arriba
        } else {
          // Lados cortos (izquierda/derecha)
          const idx = i - longSideCount * 2;
          const side = idx % 2 === 0 ? -1 : 1;
          chairX = centerX + side * radiusX - 12;
          chairY = centerY - 12;
          rotation = side === -1 ? 270 : 90; // Miran hacia el centro
        }
      } else {
        // Distribución circular para mesas redondas y cuadradas
        angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        chairX = centerX + Math.cos(angle) * radiusX - 12;
        chairY = centerY + Math.sin(angle) * radiusY - 12;
        
        // Calcular rotación para que la silla mire hacia afuera
        // La silla por defecto mira hacia abajo (0°)
        // En un círculo, la rotación debe ser el ángulo + 90° para que mire hacia afuera
        rotation = (angle * 180 / Math.PI) + 90;
      }
      
      newChairs.push({
        id: `chair_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}`,
        type: "chair",
        position: { x: chairX, y: chairY },
        size: { width: 24, height: 32 }, // Sillas más altas que anchas
        parentId: tableId,
        color: OBJECT_PRESETS.chair.color,
        rotation,
      });
    }

    setFloorPlan((prev) => ({
      ...prev,
      objects: [
        ...prev.objects.filter((o) => !chairsToRemove.has(o.id)),
        ...newChairs,
      ],
    }));

    updateObject(tableId, { capacity: count });
  }, [floorPlan.objects, updateObject]);

  const getTableStats = useCallback(() => {
    const tables = floorPlan.objects.filter((o) => o.type === "table");
    const total = tables.length;
    const occupied = tables.filter((t) => t.status === "occupied").length;
    const paying = tables.filter((t) => t.status === "paying").length;
    const reserved = tables.filter((t) => t.status === "reserved").length;
    const available = tables.filter((t) => t.status === "available").length;
    const cleaning = tables.filter((t) => t.status === "cleaning").length;
    const occupancy = total > 0 ? Math.round(((occupied + paying) / total) * 100) : 0;

    return {
      total,
      occupied,
      paying,
      reserved,
      available,
      cleaning,
      occupancy,
    };
  }, [floorPlan.objects]);

  const clearAll = useCallback(() => {
    setFloorPlan((prev) => ({ ...prev, objects: [] }));
    setSelectedObject(null);
  }, []);

  const toggleGrid = useCallback(() => {
    setFloorPlan((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const snapToGrid = useCallback((pos: Position): Position => {
    if (!floorPlan.gridSize || floorPlan.gridSize < 5) return pos;
    return {
      x: Math.round(pos.x / floorPlan.gridSize) * floorPlan.gridSize,
      y: Math.round(pos.y / floorPlan.gridSize) * floorPlan.gridSize,
    };
  }, [floorPlan.gridSize]);

  const bringToFront = useCallback((id: string) => {
    setFloorPlan((prev) => {
      const obj = prev.objects.find((o) => o.id === id);
      if (!obj) return prev;
      return {
        ...prev,
        objects: [...prev.objects.filter((o) => o.id !== id), obj],
      };
    });
  }, []);

  return {
    floorPlan,
    selectedObject,
    isEditMode,
    scale,
    setScale,
    setSelectedObject,
    setIsEditMode,
    addObject,
    updateObject,
    deleteObject,
    moveObject,
    updateTableStatus,
    addChairsToTable,
    getTableStats,
    clearAll,
    toggleGrid,
    snapToGrid,
    bringToFront,
  };
}
