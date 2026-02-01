"use client";

import React from "react";
import { motion } from "framer-motion";
import { FloorPlanObject } from "../types/floorplan";
import { cn } from "@/lib/utils";

interface ChairItemProps {
  chair: FloorPlanObject;
  isSelected: boolean;
  isEditMode: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

export function ChairItem({
  chair,
  isSelected,
  isEditMode,
  onMouseDown,
  onClick,
}: ChairItemProps) {
  const rotation = chair.rotation || 0;

  return (
    <motion.div
      className={cn(
        "absolute",
        isEditMode ? "cursor-move" : "pointer-events-none"
      )}
      style={{
        left: chair.position.x,
        top: chair.position.y,
        width: chair.size.width,
        height: chair.size.height,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      whileHover={isEditMode ? { scale: 1.1 } : {}}
    >
      <div
        className={cn(
          "w-full h-full relative transition-all duration-150",
          isSelected ? "drop-shadow-lg" : "drop-shadow-sm"
        )}
      >
        {/* Seat */}
        <div 
          className="absolute inset-0 rounded-lg"
          style={{
            background: "linear-gradient(145deg, #C49A6C 0%, #A67B5B 50%, #8B6914 100%)",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(166,95,51,0.3)",
          }}
        />
        
        {/* Backrest */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-[70%] h-[35%] rounded-t-md"
          style={{
            top: "5%",
            background: "linear-gradient(180deg, #D4B896 0%, #A67B5B 100%)",
            boxShadow: "0 1px 2px rgba(166,95,51,0.3)",
          }}
        />

        {/* Cushion */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-[80%] h-[45%] rounded-md"
          style={{
            bottom: "15%",
            background: "linear-gradient(145deg, #D4B896 0%, #A67B5B 100%)",
          }}
        />

        {/* Legs */}
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#8B4513] rounded-full opacity-60" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#8B4513] rounded-full opacity-60" />

        {/* Shine */}
        <div 
          className="absolute inset-0 rounded-lg opacity-20"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
          }}
        />
      </div>

      {isSelected && (
        <div className="absolute -inset-1 border-2 border-[#FFA142] rounded-xl pointer-events-none" />
      )}
    </motion.div>
  );
}
