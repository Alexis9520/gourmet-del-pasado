"use client";

import React from "react";
import { motion } from "framer-motion";
import { FloorPlanObject, TableStatus, STATUS_COLORS, STATUS_LABELS } from "../types/floorplan";
import { Users, Clock, Utensils, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableItemProps {
  table: FloorPlanObject;
  isSelected: boolean;
  isEditMode: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onStatusChange?: (status: TableStatus) => void;
}

export function TableItem({
  table,
  isSelected,
  isEditMode,
  onMouseDown,
  onClick,
  onStatusChange,
}: TableItemProps) {
  const status = table.status || "available";
  const colors = STATUS_COLORS[status];

  const shapeClasses = {
    round: "rounded-full",
    square: "rounded-2xl",
    rectangle: "rounded-2xl",
    bar: "rounded-xl",
  };

  const getShapeStyle = () => {
    if (table.shape === "bar") {
      return { background: "linear-gradient(180deg, #E8D5C4 0%, #D4C4B0 100%)" };
    }
    return {};
  };

  // Status indicator colors with better visibility
  const statusIndicators = {
    available: { dot: "bg-green-500", ping: "bg-green-400", icon: null },
    occupied: { dot: "bg-red-500", ping: "bg-red-400", icon: AlertCircle },
    reserved: { dot: "bg-orange-500", ping: "bg-orange-400", icon: Clock },
    paying: { dot: "bg-blue-500", ping: "bg-blue-400", icon: AlertCircle },
    cleaning: { dot: "bg-yellow-500", ping: "bg-yellow-400", icon: Utensils },
  };

  const indicator = statusIndicators[status];
  const StatusIcon = indicator.icon;

  return (
    <motion.div
      layoutId={table.id}
      className={cn(
        "absolute group",
        isEditMode ? "cursor-move" : "cursor-pointer"
      )}
      style={{
        left: table.position.x,
        top: table.position.y,
        width: table.size.width,
        height: table.size.height,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      whileHover={{ scale: isEditMode ? 1.02 : 1 }}
    >
      {/* Table body */}
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-center relative overflow-hidden",
          shapeClasses[table.shape || "round"],
          colors.bg,
          colors.border,
          "border-2 transition-all duration-200",
          isSelected ? "ring-2 ring-[#FFA142] ring-offset-2 ring-offset-[#FFF5ED]" : "",
          status === "occupied" || status === "paying" ? "shadow-xl" : "shadow-lg"
        )}
        style={{
          ...getShapeStyle(),
          boxShadow: isSelected 
            ? "0 12px 40px rgba(166, 95, 51, 0.25), 0 4px 12px rgba(166, 95, 51, 0.15)" 
            : "0 6px 20px rgba(166, 95, 51, 0.15), 0 2px 6px rgba(166, 95, 51, 0.1)",
        }}
      >
        {/* Surface shine */}
        <div 
          className={cn(
            "absolute inset-0 opacity-50",
            shapeClasses[table.shape || "round"]
          )}
          style={{
            background: table.shape === "bar" 
              ? "none"
              : "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%, rgba(166,95,51,0.05) 100%)"
          }}
        />

        {/* Table number */}
        <span className={cn("font-bold text-lg relative z-10", colors.text)}>
          {table.label || "T"}
        </span>
        
        {/* Capacity */}
        {table.capacity && (
          <div className="flex items-center gap-1 text-xs text-[#A65F33]/70 mt-0.5 relative z-10">
            <Users className="w-3 h-3" />
            <span>{table.capacity}</span>
          </div>
        )}

        {/* Status Badge - Better positioned and visible */}
        {status !== "available" && (
          <div className="absolute -top-2 -right-2 z-20">
            <div className={cn(
              "relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-lg",
              indicator.dot
            )}>
              {/* Ping animation for occupied and paying */}
              {(status === "occupied" || status === "paying") && (
                <span className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping",
                  indicator.ping
                )} />
              )}
              {/* Icon inside the dot */}
              {StatusIcon && (
                <StatusIcon className="w-3.5 h-3.5 text-white relative z-10" strokeWidth={3} />
              )}
            </div>
          </div>
        )}

        {/* Available indicator - subtle green dot */}
        {status === "available" && (
          <div className="absolute -top-1.5 -right-1.5 z-20">
            <div className={cn(
              "w-4 h-4 rounded-full border-2 border-white shadow-md",
              indicator.dot
            )} />
          </div>
        )}
      </div>

      {/* Tooltip */}
      {!isEditMode && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
          <div className="bg-[#A65F33] text-white text-sm rounded-lg py-2.5 px-4 whitespace-nowrap shadow-2xl">
            <div className="font-bold text-base">{table.label || "Mesa"}</div>
            <div className="text-white/90 capitalize flex items-center gap-2 mt-1">
              <span className={cn("w-2.5 h-2.5 rounded-full", indicator.dot)} />
              {STATUS_LABELS[status]}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#A65F33]" />
          </div>
        </div>
      )}

      {/* Quick status changer in edit mode */}
      {isEditMode && isSelected && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 flex gap-1.5 p-2 bg-white rounded-xl shadow-xl border border-[#FFE0C2] z-50">
          {(["available", "occupied", "reserved", "paying", "cleaning"] as TableStatus[]).map((s) => (
            <button
              key={s}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange?.(s);
              }}
              className={cn(
                "w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center",
                STATUS_COLORS[s].border,
                STATUS_COLORS[s].bg,
                status === s ? "ring-2 ring-offset-1 ring-[#FFA142] scale-110" : "opacity-50 hover:opacity-100 hover:scale-105"
              )}
              title={STATUS_LABELS[s]}
            >
              {s === "occupied" && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
              {s === "reserved" && <Clock className="w-3.5 h-3.5 text-orange-600" />}
              {s === "paying" && <span className="text-xs font-bold text-blue-600">$</span>}
              {s === "cleaning" && <Utensils className="w-3.5 h-3.5 text-yellow-600" />}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
