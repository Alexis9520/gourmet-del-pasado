"use client";

import React from "react";

interface WoodBackgroundProps {
  width: number;
  height: number;
}

export function WoodBackground({ width, height }: WoodBackgroundProps) {
  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        {/* Wood pattern - warmer tones to match project */}
        <pattern id="woodPatternTables" width="100" height="20" patternUnits="userSpaceOnUse">
          <rect width="100" height="20" fill="#F5EDE4" />
          
          <path
            d="M0 10 Q25 8, 50 10 T100 10"
            stroke="#E8D5C4"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M0 5 Q30 7, 60 5 T100 5"
            stroke="#DDD5C7"
            strokeWidth="0.3"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M0 15 Q20 13, 40 15 T100 15"
            stroke="#DDD5C7"
            strokeWidth="0.3"
            fill="none"
            opacity="0.6"
          />
          
          {/* Wood knots */}
          <ellipse cx="20" cy="10" rx="8" ry="4" fill="#D4C4B0" opacity="0.3" />
          <ellipse cx="70" cy="8" rx="6" ry="3" fill="#D4C4B0" opacity="0.2" />
        </pattern>

        {/* Floor gradient */}
        <linearGradient id="floorGradientTables" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFA142" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#A65F33" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Base */}
      <rect width={width} height={height} fill="url(#woodPatternTables)" />
      
      {/* Gradient overlay */}
      <rect width={width} height={height} fill="url(#floorGradientTables)" />

      {/* Vertical plank lines */}
      {Array.from({ length: Math.ceil(width / 100) }).map((_, i) => (
        <line
          key={i}
          x1={i * 100}
          y1={0}
          x2={i * 100}
          y2={height}
          stroke="#A65F33"
          strokeWidth="0.5"
          opacity="0.1"
        />
      ))}

      {/* Decorative border */}
      <rect
        x="15"
        y="15"
        width={width - 30}
        height={height - 30}
        fill="none"
        stroke="#FFA142"
        strokeWidth="1.5"
        opacity="0.2"
        rx="8"
      />
    </svg>
  );
}
