export type TableShape = "round" | "square" | "rectangle" | "bar";
export type TableStatus = "available" | "occupied" | "reserved" | "paying" | "cleaning";
export type ObjectType = "table" | "chair" | "kitchen" | "bar" | "entrance" | "plant" | "wall" | "text";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface FloorPlanObject {
  id: string;
  type: ObjectType;
  position: Position;
  size: Size;
  rotation?: number;
  label?: string;
  color?: string;
  // Para mesas
  shape?: TableShape;
  capacity?: number;
  status?: TableStatus;
  // Para sillas (referencia a mesa padre)
  parentId?: string;
  // Para texto
  fontSize?: number;
}

export interface TableOrder {
  id: string;
  items: string[];
  total: number;
  startTime: Date;
  serverName?: string;
}

export interface FloorPlanData {
  objects: FloorPlanObject[];
  name: string;
  width: number;
  height: number;
  gridSize?: number;
  showGrid: boolean;
}

export interface TableWithOrder extends FloorPlanObject {
  order?: TableOrder;
}

export const TABLE_PRESETS = {
  round: { width: 80, height: 80, label: "Mesa Redonda" },
  square: { width: 80, height: 80, label: "Mesa Cuadrada" },
  rectangle: { width: 120, height: 80, label: "Mesa Rectangular" },
  bar: { width: 60, height: 40, label: "Banqueta" },
};

export const OBJECT_PRESETS: Record<string, { width: number; height: number; label: string; color: string }> = {
  chair: { width: 24, height: 32, label: "Silla", color: "#8B4513" },
  kitchen: { width: 120, height: 80, label: "Cocina", color: "#e5e7eb" },
  bar: { width: 160, height: 60, label: "Barra", color: "#92400e" },
  entrance: { width: 80, height: 40, label: "Entrada", color: "#10b981" },
  plant: { width: 40, height: 40, label: "Planta", color: "#22c55e" },
  wall: { width: 100, height: 10, label: "Pared", color: "#374151" },
  text: { width: 100, height: 30, label: "Texto", color: "transparent" },
};

export const STATUS_COLORS: Record<TableStatus, { bg: string; border: string; text: string }> = {
  available: { bg: "bg-green-100", border: "border-green-500", text: "text-green-700" },
  occupied: { bg: "bg-red-100", border: "border-red-500", text: "text-red-700" },
  reserved: { bg: "bg-orange-100", border: "border-orange-500", text: "text-orange-700" },
  paying: { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-700" },
  cleaning: { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-700" },
};

export const STATUS_LABELS: Record<TableStatus, string> = {
  available: "Disponible",
  occupied: "Ocupada",
  reserved: "Reservada",
  paying: "Pagando",
  cleaning: "Limpieza",
};
