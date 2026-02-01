"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { FloorPlanObject, Position, ObjectType, TableStatus } from "../types/floorplan";
import { TableItem } from "./TableItem";
import { ChairItem } from "./ChairItem";
import { StaticObject } from "./StaticObject";
import { WoodBackground } from "./WoodBackground";

interface FloorPlanCanvasProps {
  floorPlan: {
    objects: FloorPlanObject[];
    width: number;
    height: number;
    showGrid: boolean;
    gridSize?: number;
  };
  isEditMode: boolean;
  selectedObject: string | null;
  scale: number;
  onSelectObject: (id: string | null) => void;
  onMoveObject: (id: string, position: Position) => void;
  onAddObject: (type: ObjectType, position: Position) => void;
  onUpdateObject: (id: string, updates: Partial<FloorPlanObject>) => void;
  snapToGrid: (pos: Position) => Position;
}

export function FloorPlanCanvas({
  floorPlan,
  isEditMode,
  selectedObject,
  scale,
  onSelectObject,
  onMoveObject,
  onAddObject,
  onUpdateObject,
  snapToGrid,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState<Position>({ x: 0, y: 0 });
  
  // Track click vs drag
  const mouseDownPos = useRef<Position>({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // Get mouse position relative to canvas
  const getCanvasPosition = useCallback((clientX: number, clientY: number): Position => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - canvasOffset.x) / scale,
      y: (clientY - rect.top - canvasOffset.y) / scale,
    };
  }, [scale, canvasOffset]);

  // Handle mouse down on object
  const handleObjectMouseDown = useCallback((e: React.MouseEvent, obj: FloorPlanObject) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Track initial mouse position to distinguish click from drag
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    hasDragged.current = false;
    
    if (!isEditMode) {
      // In view mode, just select immediately
      if (obj.type === "table") {
        onSelectObject(obj.id);
      }
      return;
    }

    // In edit mode, prepare for potential drag
    onSelectObject(obj.id);
    
    const canvasPos = getCanvasPosition(e.clientX, e.clientY);
    setDragOffset({
      x: canvasPos.x - obj.position.x,
      y: canvasPos.y - obj.position.y,
    });
    setIsDragging(true);
    setDraggedObjectId(obj.id);
  }, [isEditMode, onSelectObject, getCanvasPosition]);
  
  // Handle click on object (separate from drag)
  const handleObjectClick = useCallback((e: React.MouseEvent, obj: FloorPlanObject) => {
    // Only trigger if we didn't drag
    if (!hasDragged.current && !isEditMode && obj.type === "table") {
      onSelectObject(obj.id);
    }
  }, [isEditMode, onSelectObject]);

  // Handle canvas mouse down (for panning or adding objects)
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditMode) {
      // Check if we're clicking on empty space
      if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("grid-background")) {
        onSelectObject(null);
        
        // Start panning
        setIsPanning(true);
        setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
      }
    }
  }, [isEditMode, onSelectObject, canvasOffset]);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Check if we've dragged more than threshold (5px)
      const dragDistance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.current.x, 2) + 
        Math.pow(e.clientY - mouseDownPos.current.y, 2)
      );
      if (dragDistance > 5) {
        hasDragged.current = true;
      }
      
      if (isDragging && draggedObjectId) {
        const canvasPos = getCanvasPosition(e.clientX, e.clientY);
        let newPos = {
          x: canvasPos.x - dragOffset.x,
          y: canvasPos.y - dragOffset.y,
        };
        
        // Snap to grid in edit mode
        newPos = snapToGrid(newPos);
        
        // Keep within bounds
        newPos.x = Math.max(0, Math.min(newPos.x, floorPlan.width - 50));
        newPos.y = Math.max(0, Math.min(newPos.y, floorPlan.height - 50));
        
        onMoveObject(draggedObjectId, newPos);
      }
      
      if (isPanning) {
        setCanvasOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedObjectId(null);
      setIsPanning(false);
    };

    if (isDragging || isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isPanning, draggedObjectId, dragOffset, panStart, getCanvasPosition, onMoveObject, snapToGrid, floorPlan.width, floorPlan.height]);

  // Handle double click to add object in edit mode
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    const target = e.target as HTMLElement;
    if (target === canvasRef.current || target.classList.contains("grid-background")) {
      const pos = getCanvasPosition(e.clientX, e.clientY);
      const snappedPos = snapToGrid(pos);
      // By default add a table on double click
      onAddObject("table", snappedPos);
    }
  }, [isEditMode, getCanvasPosition, snapToGrid, onAddObject]);

  // Handle dropping from palette
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("objectType") as ObjectType;
    if (!type) return;
    
    const pos = getCanvasPosition(e.clientX, e.clientY);
    const snappedPos = snapToGrid(pos);
    onAddObject(type, snappedPos);
  }, [getCanvasPosition, snapToGrid, onAddObject]);

  // Generate grid pattern
  const gridPattern = floorPlan.showGrid && floorPlan.gridSize ? (
    <div
      className="absolute inset-0 pointer-events-none grid-background"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(166,95,51,0.15) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(166,95,51,0.15) 1px, transparent 1px)
        `,
        backgroundSize: `${floorPlan.gridSize * scale}px ${floorPlan.gridSize * scale}px`,
        transform: `translate(${canvasOffset.x % (floorPlan.gridSize * scale)}px, ${canvasOffset.y % (floorPlan.gridSize * scale)}px)`,
      }}
    />
  ) : null;

  // Sort objects: chairs first (so they appear behind tables), then by z-index
  const sortedObjects = [...floorPlan.objects].sort((a, b) => {
    if (a.type === "chair" && b.type !== "chair") return -1;
    if (a.type !== "chair" && b.type === "chair") return 1;
    return 0;
  });

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden rounded-xl ${
        isEditMode ? "border-2 border-dashed border-[#FFA142] cursor-grab active:cursor-grabbing" : "border border-[#FFE0C2]"
      }`}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "600px",
        background: "#F5EDE4",
      }}
      onMouseDown={handleCanvasMouseDown}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Fondo de madera */}
        <WoodBackground width={floorPlan.width} height={floorPlan.height} />
        
        {gridPattern}
        
        {/* Floor plan boundary */}
        <div
          className="absolute"
          style={{
            width: floorPlan.width,
            height: floorPlan.height,
            left: 0,
            top: 0,
            boxShadow: "inset 0 0 80px rgba(166,95,51,0.08), 0 8px 32px rgba(166,95,51,0.12)",
          }}
        />

        {/* Render objects */}
        {sortedObjects.map((obj) => {
          const isSelected = selectedObject === obj.id;
          
          if (obj.type === "table") {
            return (
              <TableItem
                key={obj.id}
                table={obj}
                isSelected={isSelected}
                isEditMode={isEditMode}
                onMouseDown={(e) => handleObjectMouseDown(e, obj)}
                onClick={(e) => handleObjectClick(e, obj)}
                onStatusChange={(status) => onUpdateObject(obj.id, { status })}
              />
            );
          }
          
          if (obj.type === "chair") {
            return (
              <ChairItem
                key={obj.id}
                chair={obj}
                isSelected={isSelected}
                isEditMode={isEditMode}
                onMouseDown={(e) => handleObjectMouseDown(e, obj)}
                onClick={(e) => handleObjectClick(e, obj)}
              />
            );
          }
          
          return (
            <StaticObject
              key={obj.id}
              obj={obj}
              isSelected={isSelected}
              isEditMode={isEditMode}
              onMouseDown={(e) => handleObjectMouseDown(e, obj)}
              onClick={(e) => handleObjectClick(e, obj)}
            />
          );
        })}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-20 bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-[#A65F33] shadow-md border border-[#FFE0C2]">
        {Math.round(scale * 100)}%
      </div>

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="absolute top-4 left-4 bg-[#FFA142] text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-md animate-pulse">
          ✏️ Modo Edición
        </div>
      )}
    </div>
  );
}
