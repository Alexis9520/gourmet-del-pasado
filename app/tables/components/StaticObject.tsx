"use client";

import React from "react";
import { motion } from "framer-motion";
import { FloorPlanObject } from "../types/floorplan";
import { ChefHat, DoorOpen, Flower2, Minus, Coffee, Type, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaticObjectProps {
  obj: FloorPlanObject;
  isSelected: boolean;
  isEditMode: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

const objectIcons: Record<string, React.ElementType> = {
  kitchen: UtensilsCrossed,
  bar: Coffee,
  entrance: DoorOpen,
  plant: Flower2,
  wall: Minus,
  text: Type,
};

const objectStyles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  kitchen: { 
    bg: "bg-gradient-to-br from-gray-100 to-gray-200", 
    border: "border-gray-300",
    text: "text-gray-600",
    icon: "text-gray-500"
  },
  bar: { 
    bg: "bg-gradient-to-br from-amber-700 to-amber-800", 
    border: "border-amber-900",
    text: "text-white",
    icon: "text-white"
  },
  entrance: { 
    bg: "bg-gradient-to-br from-green-500 to-green-600", 
    border: "border-green-700",
    text: "text-white",
    icon: "text-white"
  },
  plant: { 
    bg: "bg-gradient-to-br from-green-400 to-green-500", 
    border: "border-green-600",
    text: "text-white",
    icon: "text-white"
  },
  wall: { 
    bg: "bg-[#8B6914]", 
    border: "border-[#654321]",
    text: "text-white",
    icon: "text-white"
  },
  text: { 
    bg: "bg-transparent", 
    border: "border-transparent",
    text: "text-[#A65F33]",
    icon: "text-[#A65F33]"
  },
};

const objectLabels: Record<string, string> = {
  kitchen: "COCINA",
  bar: "BAR",
  entrance: "ENTRADA",
  plant: "",
  wall: "",
  text: "",
};

export function StaticObject({
  obj,
  isSelected,
  isEditMode,
  onMouseDown,
  onClick,
}: StaticObjectProps) {
  const styles = objectStyles[obj.type];
  const Icon = objectIcons[obj.type];
  const label = objectLabels[obj.type];
  const isText = obj.type === "text";
  const isWall = obj.type === "wall";
  const isPlant = obj.type === "plant";

  return (
    <motion.div
      className={cn(
        "absolute",
        isEditMode && "cursor-move"
      )}
      style={{
        left: obj.position.x,
        top: obj.position.y,
        width: obj.size.width,
        height: obj.size.height,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      whileHover={isEditMode ? { scale: 1.02 } : {}}
    >
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-center relative overflow-hidden",
          isSelected ? "ring-2 ring-[#FFA142] ring-offset-2 ring-offset-[#FFF5ED]" : "",
          !isWall && !isText && "rounded-xl shadow-md",
          isPlant && "rounded-full",
          styles.bg,
          styles.border,
          !isText && "border-2"
        )}
      >
        {/* Kitchen tiles pattern */}
        {obj.type === "kitchen" && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border border-gray-400/30" />
              ))}
            </div>
          </div>
        )}

        {/* Bar wood grain */}
        {obj.type === "bar" && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-0 right-0 h-px bg-white/50" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50" />
            <div className="absolute top-3/4 left-0 right-0 h-px bg-white/50" />
          </div>
        )}

        {/* Plant shadow */}
        {isPlant && (
          <>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-black/20 rounded-full blur-md" />
          </>
        )}

        {/* Icon - positioned above text */}
        {Icon && !isText && (
          <div className={cn("relative z-10 mb-1", styles.icon)}>
            <Icon className={cn(
              "w-6 h-6",
              obj.type === "kitchen" && "w-7 h-7"
            )} strokeWidth={2} />
          </div>
        )}
        
        {/* Label - positioned below icon */}
        {label && (
          <span className={cn(
            "relative z-10 text-[10px] font-bold tracking-wider",
            styles.text
          )}>
            {label}
          </span>
        )}
        
        {/* Text label for text objects */}
        {isText && obj.label && (
          <span 
            className="text-[#A65F33] font-medium text-center px-1"
            style={{ fontSize: obj.fontSize || 14 }}
          >
            {obj.label}
          </span>
        )}
      </div>

      {/* Resize handle in edit mode */}
      {isEditMode && isSelected && (
        <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#FFA142] rounded-full border-2 border-white shadow-md" />
      )}
    </motion.div>
  );
}
