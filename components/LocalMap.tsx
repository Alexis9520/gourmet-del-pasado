import React from "react"

// Tipo de estado de mesa
type MesaStatus = "libre" | "ocupada" | "esperando";

// Definición de colores para cada estado - Paleta moderna y minimalista
const mesaColors: Record<MesaStatus, string> = {
  libre: "#FFFFFF",
  ocupada: "#1A1A2E",
  esperando: "#FF6B35",
}

const mesaBorders: Record<MesaStatus, string> = {
  libre: "#D4E8D4",
  ocupada: "#1A1A2E",
  esperando: "#FF6B35",
}

const mesaTextColors: Record<MesaStatus, string> = {
  libre: "#2D3748",
  ocupada: "#FFFFFF",
  esperando: "#FFFFFF",
}

// Función para validar y normalizar el estado
function normalizeStatus(status?: string): MesaStatus {
  const validStatuses: MesaStatus[] = ["libre", "ocupada", "esperando"];
  if (status && validStatuses.includes(status as MesaStatus)) {
    return status as MesaStatus;
  }
  if (status === "reservada") {
    return "ocupada";
  }
  return "libre";
}

// Asientos mejorados - Diseño más elegante y visible
function ChairIndicators({ color = "#BDC3C7", size = 100, status = "libre" }: { color?: string; size?: number; status?: MesaStatus }) {
  const chairColor = status === "libre" ? "#C8D6C8" : color
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", top: 0, left: 0 }}>
      {/* Silla superior */}
      <rect x="42" y="4" width="16" height="10" rx="3" fill={chairColor} opacity="0.9" />
      {/* Silla derecha */}
      <rect x="86" y="42" width="10" height="16" rx="3" fill={chairColor} opacity="0.9" />
      {/* Silla inferior */}
      <rect x="42" y="86" width="16" height="10" rx="3" fill={chairColor} opacity="0.9" />
      {/* Silla izquierda */}
      <rect x="4" y="42" width="10" height="16" rx="3" fill={chairColor} opacity="0.9" />
    </svg>
  )
}

// Indicador de estado visual
function StatusIndicator({ status }: { status: MesaStatus }) {
  const statusConfig: Record<MesaStatus, { icon: string; label: string }> = {
    libre: { icon: "✓", label: "Libre" },
    ocupada: { icon: "●", label: "Ocupada" },
    esperando: { icon: "⏱", label: "Esperando" },
  }
  
  const config = statusConfig[status]
  
  if (!config) {
    console.warn(`Estado inválido: ${status}`)
    return null
  }
  
  return (
    <div style={{
      position: "absolute",
      bottom: "-28px",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "12px",
      fontWeight: 600,
      color: "#FFFFFF",
      backgroundColor: mesaBorders[status],
      padding: "5px 14px",
      borderRadius: "14px",
      whiteSpace: "nowrap",
      letterSpacing: "0.3px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    }}>
      {config.icon} {config.label}
    </div>
  )
}

type TableCircleProps = {
  number: number;
  status?: string;
  onClick?: () => void;
};

function TableCircle({ number, status: rawStatus, onClick }: TableCircleProps) {
  const status = normalizeStatus(rawStatus)
  const bg = mesaColors[status]
  const textColor = mesaTextColors[status]
  const borderColor = mesaBorders[status]
  
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: bg,
        border: `4px solid ${borderColor}`,
        boxShadow: status !== "libre" 
          ? `0 10px 30px ${borderColor}50, 0 4px 12px ${borderColor}30`
          : "0 4px 16px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "36px 24px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: status !== "libre" ? "scale(1.03)" : "scale(1)",
      }}
      className="table-circle"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.12) translateY(-4px)"
        e.currentTarget.style.boxShadow = status !== "libre"
          ? `0 16px 40px ${borderColor}60, 0 6px 16px ${borderColor}40`
          : "0 12px 32px rgba(0,0,0,0.15)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = status !== "libre" ? "scale(1.03)" : "scale(1)"
        e.currentTarget.style.boxShadow = status !== "libre"
          ? `0 10px 30px ${borderColor}50, 0 4px 12px ${borderColor}30`
          : "0 4px 16px rgba(0,0,0,0.08)"
      }}
    >
      <ChairIndicators color={borderColor} status={status} />
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{
          fontWeight: 800,
          fontSize: 42,
          color: textColor,
          letterSpacing: "-0.03em",
          fontFamily: "'Inter', 'SF Pro Display', 'Segoe UI', sans-serif",
          textShadow: status === "libre" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
          lineHeight: 1,
        }}>
          {number}
        </span>
      </div>
      <StatusIndicator status={status} />
    </div>
  )
}

// Layout tipo grilla mejorado
const mesaLayout = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
]

// Encuentra mesa por número
function findMesaData(
  tables: Array<{ number: number; status?: string }>,
  num: number
) {
  return tables.find(m => Number(m.number) === num)
}

type MesaData = { number: number; status?: string };
type LocalMapProps = {
  tables: MesaData[];
  onTableClick: (mesa: MesaData) => void;
};

// Leyenda de estados mejorada
function StatusLegend() {
  const legendItems: Array<{ status: MesaStatus; label: string; icon: string }> = [
    { status: "libre", label: "Libre", icon: "✓" },
    { status: "ocupada", label: "Ocupada", icon: "●" },
    { status: "esperando", label: "Esperando plato", icon: "⏱" },
  ]

  return (
    <div style={{
      display: "flex",
      gap: "28px",
      marginBottom: "36px",
      padding: "18px 28px",
      background: "rgba(255,255,255,0.8)",
      borderRadius: "18px",
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    }}>
      {legendItems.map(({ status, label, icon }) => (
        <div key={status} style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: mesaColors[status],
            border: `3px solid ${mesaBorders[status]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: 700,
            color: status === "libre" ? "#2D3748" : "#FFFFFF",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>
            {icon}
          </div>
          <span style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#2D3748",
            fontFamily: "'Inter', 'SF Pro Display', 'Segoe UI', sans-serif",
          }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function LocalMap({ tables, onTableClick }: LocalMapProps) {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: "1100px",
      minHeight: "650px",
      background: "linear-gradient(145deg, #F5F7FA 0%, #E4E9F0 100%)",
      borderRadius: "36px",
      boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)",
      padding: "52px 40px",
      margin: "20px auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Título */}
      <h2 style={{
        fontSize: "28px",
        fontWeight: 800,
        color: "#1A202C",
        marginBottom: "12px",
        fontFamily: "'Inter', 'SF Pro Display', 'Segoe UI', sans-serif",
        letterSpacing: "-0.03em",
      }}>
        Mapa de Mesas
      </h2>
      
      {/* Leyenda de estados */}
      <StatusLegend />
      
      {/* Grilla de mesas */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px",
      }}>
        {mesaLayout.map((row, rowIdx) => (
          <div key={rowIdx} style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: "28px",
          }}>
            {row.map((num) => {
              const mesa = findMesaData(tables, num) || { number: num, status: "libre" }
              return (
                <TableCircle
                  key={num}
                  number={mesa.number}
                  status={mesa.status}
                  onClick={() => onTableClick(mesa)}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}