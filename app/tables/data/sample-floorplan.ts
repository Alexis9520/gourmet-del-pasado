import { FloorPlanData } from "../types/floorplan";

export const SAMPLE_FLOOR_PLAN: FloorPlanData = {
  name: "Planta Principal",
  width: 1000,
  height: 700,
  gridSize: 20,
  showGrid: true,
  objects: [
    // Kitchen area (top left)
    {
      id: "kitchen_1",
      type: "kitchen",
      position: { x: 20, y: 20 },
      size: { width: 150, height: 100 },
      label: "COCINA",
      color: "#e5e7eb",
    },
    // Bar area (top right)
    {
      id: "bar_1",
      type: "bar",
      position: { x: 700, y: 30 },
      size: { width: 180, height: 50 },
      label: "BAR",
      color: "#92400e",
    },
    // Entrance (bottom)
    {
      id: "entrance_1",
      type: "entrance",
      position: { x: 450, y: 640 },
      size: { width: 100, height: 40 },
      label: "ENTRADA",
      color: "#10b981",
    },
    // Table T1 - Round, occupied
    {
      id: "table_t1",
      type: "table",
      position: { x: 250, y: 180 },
      size: { width: 80, height: 80 },
      shape: "round",
      label: "T1",
      capacity: 4,
      status: "occupied",
    },
    // Chairs for T1 - posicionadas correctamente mirando hacia afuera
    { id: "chair_t1_0", type: "chair", position: { x: 278, y: 142 }, size: { width: 24, height: 32 }, parentId: "table_t1", color: "#8B4513", rotation: 0 },     // Arriba
    { id: "chair_t1_1", type: "chair", position: { x: 306, y: 194 }, size: { width: 24, height: 32 }, parentId: "table_t1", color: "#8B4513", rotation: 90 },    // Derecha
    { id: "chair_t1_2", type: "chair", position: { x: 278, y: 238 }, size: { width: 24, height: 32 }, parentId: "table_t1", color: "#8B4513", rotation: 180 },   // Abajo
    { id: "chair_t1_3", type: "chair", position: { x: 226, y: 194 }, size: { width: 24, height: 32 }, parentId: "table_t1", color: "#8B4513", rotation: 270 },   // Izquierda

    // Table T2 - Square, available
    {
      id: "table_t2",
      type: "table",
      position: { x: 450, y: 180 },
      size: { width: 80, height: 80 },
      shape: "square",
      label: "T2",
      capacity: 4,
      status: "available",
    },
    // Chairs for T2
    { id: "chair_t2_0", type: "chair", position: { x: 478, y: 142 }, size: { width: 24, height: 32 }, parentId: "table_t2", color: "#8B4513", rotation: 0 },
    { id: "chair_t2_1", type: "chair", position: { x: 506, y: 194 }, size: { width: 24, height: 32 }, parentId: "table_t2", color: "#8B4513", rotation: 90 },
    { id: "chair_t2_2", type: "chair", position: { x: 478, y: 238 }, size: { width: 24, height: 32 }, parentId: "table_t2", color: "#8B4513", rotation: 180 },
    { id: "chair_t2_3", type: "chair", position: { x: 426, y: 194 }, size: { width: 24, height: 32 }, parentId: "table_t2", color: "#8B4513", rotation: 270 },

    // Table T3 - Rectangle, reserved
    {
      id: "table_t3",
      type: "table",
      position: { x: 650, y: 170 },
      size: { width: 120, height: 80 },
      shape: "rectangle",
      label: "T3",
      capacity: 6,
      status: "reserved",
    },
    // Chairs for T3 (6 chairs) - distribución rectangular
    { id: "chair_t3_0", type: "chair", position: { x: 680, y: 138 }, size: { width: 24, height: 32 }, parentId: "table_t3", color: "#8B4513", rotation: 0 },     // Arriba izq
    { id: "chair_t3_1", type: "chair", position: { x: 718, y: 138 }, size: { width: 24, height: 32 }, parentId: "table_t3", color: "#8B4513", rotation: 0 },     // Arriba der
    { id: "chair_t3_2", type: "chair", position: { x: 780, y: 194 }, size: { width: 24, height: 32 }, parentId: "table_t3", color: "#8B4513", rotation: 90 },    // Derecha
    { id: "chair_t3_3", type: "chair", position: { x: 718, y: 250 }, size: { width: 24, height: 32 }, parentId: "table_t3", color: "#8B4513", rotation: 180 },   // Abajo der
    { id: "chair_t3_4", type: "chair", position: { x: 680, y: 250 }, size: { width: 24, height: 32 }, parentId: "table_t3", color: "#8B4513", rotation: 180 },   // Abajo izq
    { id: "chair_t3_5", type: "chair", position: { x: 616, y: 194 }, size: { width: 24, height: 32 }, parentId: "table_t3", color: "#8B4513", rotation: 270 },   // Izquierda

    // Table T8 - Large round, paying (like in the image)
    {
      id: "table_t8",
      type: "table",
      position: { x: 550, y: 380 },
      size: { width: 100, height: 100 },
      shape: "round",
      label: "T8",
      capacity: 8,
      status: "paying",
    },
    // Chairs for T8 (8 chairs) - distribución circular
    { id: "chair_t8_0", type: "chair", position: { x: 588, y: 346 }, size: { width: 24, height: 32 }, parentId: "table_t8", color: "#8B4513", rotation: 0 },      // Arriba
    { id: "chair_t8_1", type: "chair", position: { x: 622, y: 362 }, size: { width: 24, height: 32 }, parentId: "table_t8", color: "#8B4513", rotation: 45 },     // Arriba-der
    { id: "chair_t8_2", type: "chair", position: { x: 638, y: 398 }, size: { width: 24, height: 32 }, parentId: "table_t8", color: "#8B4513", rotation: 90 },     // Derecha
    { id: "chair_t8_3", type: "chair", position: { x: 622, y: 434 }, size: { width: 24, height: 32 }, parentId: "table_t8", color: "#8B4513", rotation: 135 },    // Abajo-der
    { id: "chair_t8_4", type: "chair", position: { x: 588, y: 450 }, size: { width: 24, height: 32 }, parentId: "table_t8", color: "#8B4513", rotation: 180 },    // Abajo
    { id: "chair_t8_5", type: "chair", position: { x: 554, y: 434 }, size: { width: 24, height: 32 }, parentId: "table_t8", color: "#8B4513", rotation: 225 },    // Abajo-izq
    { id: "chair_t8_6", type: "chair", position: { x: 538, y: 398 }, size: { width: 24, height: 32 }, parentId: "table_t8", color: "#8B4513", rotation: 270 },    // Izquierda
    { id: "chair_t8_7", type: "chair", position: { x: 554, y: 362 }, size: { width: 24, height: 32 }, parentId: "table_t8", color: "#8B4513", rotation: 315 },    // Arriba-izq

    // Bar tables B1, B2
    {
      id: "table_b1",
      type: "table",
      position: { x: 200, y: 500 },
      size: { width: 60, height: 40 },
      shape: "bar",
      label: "B1",
      capacity: 2,
      status: "available",
    },
    { id: "chair_b1_0", type: "chair", position: { x: 188, y: 524 }, size: { width: 24, height: 32 }, parentId: "table_b1", color: "#8B4513", rotation: 180 },   // Abajo
    { id: "chair_b1_1", type: "chair", position: { x: 248, y: 524 }, size: { width: 24, height: 32 }, parentId: "table_b1", color: "#8B4513", rotation: 180 },   // Abajo

    {
      id: "table_b2",
      type: "table",
      position: { x: 320, y: 500 },
      size: { width: 60, height: 40 },
      shape: "bar",
      label: "B2",
      capacity: 2,
      status: "occupied",
    },
    { id: "chair_b2_0", type: "chair", position: { x: 308, y: 524 }, size: { width: 24, height: 32 }, parentId: "table_b2", color: "#8B4513", rotation: 180 },
    { id: "chair_b2_1", type: "chair", position: { x: 368, y: 524 }, size: { width: 24, height: 32 }, parentId: "table_b2", color: "#8B4513", rotation: 180 },

    // Additional round table T4
    {
      id: "table_t4",
      type: "table",
      position: { x: 800, y: 280 },
      size: { width: 80, height: 80 },
      shape: "round",
      label: "T4",
      capacity: 4,
      status: "available",
    },
    { id: "chair_t4_0", type: "chair", position: { x: 828, y: 242 }, size: { width: 24, height: 32 }, parentId: "table_t4", color: "#8B4513", rotation: 0 },
    { id: "chair_t4_1", type: "chair", position: { x: 856, y: 294 }, size: { width: 24, height: 32 }, parentId: "table_t4", color: "#8B4513", rotation: 90 },
    { id: "chair_t4_2", type: "chair", position: { x: 828, y: 338 }, size: { width: 24, height: 32 }, parentId: "table_t4", color: "#8B4513", rotation: 180 },
    { id: "chair_t4_3", type: "chair", position: { x: 776, y: 294 }, size: { width: 24, height: 32 }, parentId: "table_t4", color: "#8B4513", rotation: 270 },

    // Square table T5
    {
      id: "table_t5",
      type: "table",
      position: { x: 150, y: 320 },
      size: { width: 80, height: 80 },
      shape: "square",
      label: "T5",
      capacity: 4,
      status: "cleaning",
    },
    { id: "chair_t5_0", type: "chair", position: { x: 178, y: 282 }, size: { width: 24, height: 32 }, parentId: "table_t5", color: "#8B4513", rotation: 0 },
    { id: "chair_t5_1", type: "chair", position: { x: 206, y: 334 }, size: { width: 24, height: 32 }, parentId: "table_t5", color: "#8B4513", rotation: 90 },
    { id: "chair_t5_2", type: "chair", position: { x: 178, y: 378 }, size: { width: 24, height: 32 }, parentId: "table_t5", color: "#8B4513", rotation: 180 },
    { id: "chair_t5_3", type: "chair", position: { x: 126, y: 334 }, size: { width: 24, height: 32 }, parentId: "table_t5", color: "#8B4513", rotation: 270 },

    // Decorative plants
    {
      id: "plant_1",
      type: "plant",
      position: { x: 920, y: 450 },
      size: { width: 50, height: 50 },
      label: "",
      color: "#22c55e",
    },
    {
      id: "plant_2",
      type: "plant",
      position: { x: 60, y: 420 },
      size: { width: 45, height: 45 },
      label: "",
      color: "#22c55e",
    },
    {
      id: "plant_3",
      type: "plant",
      position: { x: 450, y: 320 },
      size: { width: 40, height: 40 },
      label: "",
      color: "#22c55e",
    },

    // Wall separators
    {
      id: "wall_1",
      type: "wall",
      position: { x: 380, y: 120 },
      size: { width: 120, height: 8 },
      label: "",
      color: "#374151",
    },
    {
      id: "wall_2",
      type: "wall",
      position: { x: 180, y: 420 },
      size: { width: 8, height: 80 },
      label: "",
      color: "#374151",
    },
  ],
};
