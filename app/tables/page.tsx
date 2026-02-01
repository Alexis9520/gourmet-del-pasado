"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, Plus, Settings, ZoomIn, ZoomOut, Grid3X3, 
  Save, Download, Upload, RotateCcw, Trash2, Edit3, Eye,
  Circle, Square, RectangleHorizontal, Armchair, ChefHat, 
  DoorOpen, Flower2, Minus, Coffee, Type, CheckCircle2,
  AlertCircle, DollarSign, Sparkles, Users, Clock
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFloorPlan } from "./hooks/useFloorPlan";
import { FloorPlanCanvas } from "./components/FloorPlanCanvas";
import { TablePopup } from "./components/TablePopup";
import { ObjectType, TableShape, Position, TableStatus, STATUS_COLORS, STATUS_LABELS } from "./types/floorplan";
import { cn } from "@/lib/utils";

export default function TablesPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const {
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
  } = useFloorPlan();

  const [popupPosition, setPopupPosition] = useState<Position | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const stats = getTableStats();

  // Handle adding a table
  const handleAddTable = useCallback((shape: TableShape) => {
    const centerX = floorPlan.width / 2 - 40;
    const centerY = floorPlan.height / 2 - 40;
    const tableId = addObject("table", { x: centerX, y: centerY }, { shape });
    
    const chairCount = shape === "bar" ? 2 : shape === "rectangle" ? 6 : 4;
    setTimeout(() => addChairsToTable(tableId, chairCount), 0);
    
    setSelectedObject(tableId);
    bringToFront(tableId);
  }, [addObject, addChairsToTable, floorPlan.width, floorPlan.height, setSelectedObject, bringToFront]);

  // Handle adding other objects
  const handleAddObject = useCallback((type: Exclude<ObjectType, "table">) => {
    const centerX = floorPlan.width / 2 - 20;
    const centerY = floorPlan.height / 2 - 20;
    addObject(type, { x: centerX, y: centerY });
  }, [addObject, floorPlan.width, floorPlan.height]);

  // Handle selecting an object
  const handleSelectObject = useCallback((id: string | null, position?: Position) => {
    setSelectedObject(id);
    if (id && position) {
      setPopupPosition(position);
    } else {
      setPopupPosition(null);
    }
  }, [setSelectedObject]);

  // Handle object click from canvas
  const handleObjectClick = useCallback((obj: { id: string; position: Position }) => {
    const object = floorPlan.objects.find((o) => o.id === obj.id);
    if (object && object.type === "table") {
      const popupX = object.position.x + object.size.width + 20;
      const popupY = object.position.y;
      handleSelectObject(obj.id, { x: popupX, y: popupY });
    }
  }, [floorPlan.objects, handleSelectObject]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.1, 2));
  }, [setScale]);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(s - 0.1, 0.5));
  }, [setScale]);

  const handleReset = useCallback(() => {
    setScale(1);
  }, [setScale]);

  // Export/Import
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(floorPlan, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `floorplan-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [floorPlan]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            if (data.objects && Array.isArray(data.objects)) {
              localStorage.setItem("floorPlan", JSON.stringify(data));
              window.location.reload();
            }
          } catch (err) {
            alert("Error al importar el archivo");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  // Get selected table object
  const selectedTable = selectedObject 
    ? floorPlan.objects.find((o) => o.id === selectedObject)
    : null;

  // Palette item component
  const PaletteItem = ({ icon: Icon, label, onClick, color = "#A65F33" }: { 
    icon: React.ElementType; 
    label: string; 
    onClick: () => void;
    color?: string;
  }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#FFF5ED] hover:bg-[#FFE0C2] border border-[#FFE0C2] transition-all group"
    >
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm"
        style={{ color }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[10px] font-medium text-[#A65F33]">{label}</span>
    </motion.button>
  );

  return (
    <div className="flex h-screen bg-[#FFF5ED]">
      <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen((s) => !s)} />

        <main className="flex-1 overflow-hidden flex">
          {/* Left Panel - Stats & Controls */}
          <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-[#FFE0C2] bg-[#FFF3E5] p-4 space-y-4">
            {/* Service Info */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-[#A65F33]">Servicio Cena</h2>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">EN VIVO</Badge>
              </div>
              <p className="text-sm text-[#A65F33]/60">16:00 - 23:00</p>
            </div>

            {/* Occupancy Card */}
            <Card className="border-[#FFE0C2] bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#A65F33]/70">Ocupación</span>
                  <span className="text-2xl font-bold text-[#FFA142]">{stats.occupancy}%</span>
                </div>
                <div className="w-full bg-[#FFE0C2] rounded-full h-2">
                  <div
                    className="bg-[#FFA142] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.occupancy}%` }}
                  />
                </div>
                <p className="text-xs text-[#A65F33]/60 mt-2">
                  {stats.occupied + stats.paying}/{stats.total} mesas ocupadas
                </p>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="border-[#FFE0C2] bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-[#A65F33]/40 uppercase tracking-wider">
                  Leyenda
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {[
                    { status: "available" as const, label: "Disponible", color: "bg-green-400" },
                    { status: "occupied" as const, label: "Ocupada", color: "bg-red-400" },
                    { status: "reserved" as const, label: "Reservada", color: "bg-orange-400" },
                    { status: "paying" as const, label: "Pagando", color: "bg-blue-400" },
                    { status: "cleaning" as const, label: "Limpieza", color: "bg-yellow-400" },
                  ].map(({ status, label, color }) => (
                    <div key={status} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-sm text-[#A65F33]">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={isEditMode ? "outline" : "default"}
                className={cn(
                  "flex-1 gap-2",
                  !isEditMode && "bg-[#FFA142] hover:bg-[#FFA142]/90 text-white"
                )}
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedObject(null);
                  setPopupPosition(null);
                }}
              >
                <Eye className="w-4 h-4" />
                Vista
              </Button>
              <Button
                variant={isEditMode ? "default" : "outline"}
                className={cn(
                  "flex-1 gap-2",
                  isEditMode && "bg-[#FFA142] hover:bg-[#FFA142]/90 text-white"
                )}
                onClick={() => setIsEditMode(true)}
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </Button>
            </div>

            {/* Edit Mode Controls */}
            <AnimatePresence>
              {isEditMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Tables Palette */}
                  <Card className="border-[#FFE0C2] bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-[#A65F33]/40 uppercase">
                        Mesas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-2">
                        <PaletteItem icon={Circle} label="Redonda" onClick={() => handleAddTable("round")} />
                        <PaletteItem icon={Square} label="Cuadrada" onClick={() => handleAddTable("square")} />
                        <PaletteItem icon={RectangleHorizontal} label="Rectangular" onClick={() => handleAddTable("rectangle")} />
                        <PaletteItem icon={Minus} label="Banqueta" onClick={() => handleAddTable("bar")} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Furniture Palette */}
                  <Card className="border-[#FFE0C2] bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-[#A65F33]/40 uppercase">
                        Mobiliario
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-3 gap-2">
                        <PaletteItem icon={Armchair} label="Silla" onClick={() => handleAddObject("chair")} />
                        <PaletteItem icon={ChefHat} label="Cocina" onClick={() => handleAddObject("kitchen")} />
                        <PaletteItem icon={Coffee} label="Barra" onClick={() => handleAddObject("bar")} />
                        <PaletteItem icon={DoorOpen} label="Entrada" onClick={() => handleAddObject("entrance")} />
                        <PaletteItem icon={Flower2} label="Planta" onClick={() => handleAddObject("plant")} />
                        <PaletteItem icon={Type} label="Texto" onClick={() => handleAddObject("text")} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1 border-[#FFE0C2] text-[#A65F33]"
                      onClick={handleExport}
                    >
                      <Download className="w-4 h-4" />
                      Exportar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1 border-[#FFE0C2] text-[#A65F33]"
                      onClick={handleImport}
                    >
                      <Upload className="w-4 h-4" />
                      Importar
                    </Button>
                  </div>

                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full gap-1"
                    onClick={clearAll}
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpiar Todo
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats Summary */}
            <Card className="border-[#FFE0C2] bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-[#A65F33]/40 uppercase">
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-lg font-bold">{stats.available}</span>
                    </div>
                    <span className="text-xs text-green-600">Disponibles</span>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-lg font-bold">{stats.occupied}</span>
                    </div>
                    <span className="text-xs text-red-600">Ocupadas</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-700">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-lg font-bold">{stats.paying}</span>
                    </div>
                    <span className="text-xs text-blue-600">Pagando</span>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-700">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-lg font-bold">{stats.cleaning}</span>
                    </div>
                    <span className="text-xs text-yellow-600">Limpieza</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="h-14 border-b border-[#FFE0C2] bg-[#FFF3E5] px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#A65F33]">{floorPlan.name}</span>
                {isEditMode && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    Modo Edición
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#A65F33] hover:bg-[#FFE0C2]"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-[#A65F33] w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#A65F33] hover:bg-[#FFE0C2]"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <div className="w-px h-6 bg-[#FFE0C2] mx-2" />
                
                <Button
                  variant={floorPlan.showGrid ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-1",
                    floorPlan.showGrid 
                      ? "bg-[#FFA142] hover:bg-[#FFA142]/90 text-white" 
                      : "text-[#A65F33] hover:bg-[#FFE0C2]"
                  )}
                  onClick={toggleGrid}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Cuadrícula
                </Button>

                {isEditMode && (
                  <>
                    <div className="w-px h-6 bg-[#FFE0C2] mx-2" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#A65F33] hover:bg-[#FFE0C2]"
                      onClick={handleReset}
                      title="Resetear zoom"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-[#FFA142] hover:bg-[#FFA142]/90 text-white gap-1"
                      onClick={() => {
                        localStorage.setItem("floorPlan", JSON.stringify(floorPlan));
                      }}
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden bg-[#FFF5ED]" ref={canvasRef}>
              <FloorPlanCanvas
                floorPlan={floorPlan}
                isEditMode={isEditMode}
                selectedObject={selectedObject}
                scale={scale}
                onSelectObject={(id) => {
                  if (id) {
                    const obj = floorPlan.objects.find((o) => o.id === id);
                    if (obj) {
                      handleObjectClick({ id, position: obj.position });
                    }
                  } else {
                    handleSelectObject(null);
                  }
                }}
                onMoveObject={moveObject}
                onAddObject={addObject}
                onUpdateObject={updateObject}
                snapToGrid={snapToGrid}
              />

              {/* Table Popup */}
              {selectedTable && popupPosition && (
                <TablePopup
                  table={selectedTable}
                  position={popupPosition}
                  onClose={() => {
                    setSelectedObject(null);
                    setPopupPosition(null);
                  }}
                  onStatusChange={(status) => {
                    updateTableStatus(selectedTable.id, status);
                  }}
                  onAddChairs={(count) => {
                    addChairsToTable(selectedTable.id, count);
                  }}
                  onPrintBill={() => {
                    alert("Imprimiendo cuenta...");
                  }}
                  onAddOrder={() => {
                    alert("Abriendo menú para agregar orden...");
                  }}
                />
              )}

              {/* Floating Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white shadow-md hover:bg-[#FFF5ED] text-[#A65F33]"
                  onClick={handleZoomIn}
                >
                  <span className="text-lg font-bold">+</span>
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white shadow-md hover:bg-[#FFF5ED] text-[#A65F33]"
                  onClick={handleZoomOut}
                >
                  <span className="text-lg font-bold">−</span>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
