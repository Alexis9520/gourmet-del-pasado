import React from "react"

export function TableCard({ table, onClick }: { table: any, onClick: () => void }) {
  const statusStyles = {
    libre: {
      bg: "bg-gradient-to-br from-[#FFE7B7] via-[#F68C1F] to-[#FFA142]",
      dot: "#F68C1F",
      text: "Libre",
      shadow: "shadow-lg shadow-[#FFA14255]"
    },
    ocupada: {
      bg: "bg-gradient-to-br from-[#FFB7B7] via-[#FF7043] to-[#FF4234]",
      dot: "#FF7043",
      text: "Ocupada",
      shadow: "shadow-lg shadow-[#FF704355]"
    },
    reservada: {
      bg: "bg-gradient-to-br from-[#C4F7B7] via-[#7DBB3C] to-[#3CBF7B]",
      dot: "#7DBB3C",
      text: "Reservada",
      shadow: "shadow-lg shadow-[#7DBB3C44]"
    },
  }

  // El estado debe coincidir con tu lógica actual (ajusta si el estado se llama diferente)
  type StatusKey = keyof typeof statusStyles
  const estado: StatusKey = (table.status as StatusKey) || "libre"
  const style = statusStyles[estado] || statusStyles.libre

  return (
    <button
      className={`relative flex flex-col items-center justify-center rounded-full ${style.bg} ${style.shadow} transition-all duration-200 hover:scale-105 hover:ring-4 hover:ring-[#F68C1F30] focus:outline-none w-44 h-44 mx-auto mb-2`}
      style={{
        minWidth: "140px",
        minHeight: "140px",
        border: "6px solid #fff",
        boxShadow: "0 6px 16px #00000014",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={onClick}
    >
      {/* Sombra tipo mesa */}
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "18px",
          background: "radial-gradient(ellipse at center, #00000013 0%, transparent 100%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      ></div>

      {/* Ícono de mesa */}
      <svg width="36" height="36" viewBox="0 0 36 36" className="mb-2" fill="none">
        <ellipse cx="18" cy="14" rx="14" ry="7" fill="#fff" opacity="0.4"/>
        <ellipse cx="18" cy="14" rx="13" ry="6" fill="#fff" />
        <ellipse cx="18" cy="14" rx="10" ry="4" fill={style.dot} />
      </svg>

      <span className="font-bold text-2xl text-[#A65F33] z-10">{table.name}</span>
      <span className="mt-1 text-base font-semibold z-10" style={{ color: style.dot }}>{style.text}</span>
    </button>
  )
}