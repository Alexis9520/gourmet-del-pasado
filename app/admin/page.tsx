"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePOSStore } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DishFormModal } from "@/components/dish-form-modal"
import { Plus, Edit2, Trash2, Utensils, CupSoda, IceCream, Salad } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { MenuItem } from "@/lib/store"
import { JSX } from "react/jsx-runtime"

// Iconos para categorías
const categoryIcons: Record<string, JSX.Element> = {
  Entradas: <Salad className="mr-1 h-5 w-5" />,
  Fondos: <Utensils className="mr-1 h-5 w-5" />,
  Bebidas: <CupSoda className="mr-1 h-5 w-5" />,
  Postres: <IceCream className="mr-1 h-5 w-5" />
}

// Variaciones suaves de naranja para las categorías (todas del mismo color base, solo opacidad/fondo)
const categoryBadgeColors: Record<string, string> = {
  Entradas: "bg-[#FFE1C1] text-[#F68C1F]",
  Fondos: "bg-[#FFEDD7] text-[#F68C1F]",
  Bebidas: "bg-[#FFF3E6] text-[#F68C1F]",
  Postres: "bg-[#FFF9F2] text-[#F68C1F]",
}

export default function AdminPage() {
  const router = useRouter()
  const { currentUser, menuItems, toggleMenuItemAvailability, addMenuItem, updateMenuItem, deleteMenuItem } =
    usePOSStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDish, setEditingDish] = useState<MenuItem | undefined>(undefined)

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
    }
  }, [currentUser, router])

  if (!currentUser || currentUser.role !== "admin") return null

  const categories = ["Entradas", "Fondos", "Bebidas", "Postres"]

  const handleAddDish = () => {
    setEditingDish(undefined)
    setIsModalOpen(true)
  }

  const handleEditDish = (dish: MenuItem) => {
    setEditingDish(dish)
    setIsModalOpen(true)
  }

  const handleDeleteDish = (id: string) => {
    if (confirm("¿Está seguro de eliminar este plato?")) {
      deleteMenuItem(id)
    }
  }

  const handleSubmitDish = (dish: Omit<MenuItem, "id">) => {
    if (editingDish) {
      updateMenuItem(editingDish.id, dish)
    } else {
      addMenuItem(dish)
    }
  }

  return (
    <div className="flex h-screen bg-[#FAF8F4] font-modern">
      <style>{`
        .font-modern {
          font-family: 'Montserrat', 'Poppins', 'Segoe UI', 'sans-serif';
        }
        .stats-grid {
          margin-bottom: 2rem;
        }
        .stats-card {
          background: #FFF;
          border-radius: 18px;
          border: 1.5px solid #F2E5D8;
          box-shadow: 0 1px 8px #FFD8B022;
          transition: box-shadow .15s;
          position: relative;
          overflow: hidden;
          min-width: 180px;
        }
        .stats-card:hover {
          box-shadow: 0 2px 14px #FFD8B055;
        }
        .stats-card .icon-bg {
          position: absolute;
          opacity: 0.08;
          right: 10px;
          bottom: 0;
          z-index: 0;
        }
        .stats-title {
          color: #A65F33;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .add-btn {
          background: linear-gradient(90deg, #FFA142 70%, #F68C1F 100%);
          color: #fff;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          box-shadow: 0 2px 8px 0 #FFA14233;
          transition: background 0.15s, transform 0.15s;
        }
        .add-btn:hover {
          background: linear-gradient(90deg, #FFB167 70%, #F68C1F 100%);
          transform: translateY(-2px) scale(1.04);
        }
        .badge-category {
          font-weight: 600;
          border-radius: 12px;
          padding: 4px 14px;
          font-size: .97em;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: none;
        }
        .table-card {
          background: #FFF;
          border-radius: 18px;
          border: 1.5px solid #F2E5D8;
          box-shadow: 0 1.5px 12px #FFD8B022;
          padding: 0;
        }
        .table-head-bg {
          background: #F8F7F4;
        }
        .row-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .table-row-hover:hover {
          background: #FFF4E0;
          transition: background 0.15s;
        }
        .dish-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #A65F33;
        }
        .estado-true {
          color: #36B37E;
          font-weight: 500;
        }
        .estado-false {
          color: #FF7043;
          font-weight: 500;
        }
        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 800px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .table-card {
            border-radius: 8px !important;
            padding: 2px !important;
          }
        }
        @media (max-width: 600px) {
          .stats-card {
            min-width: 140px !important;
            padding: 10px 6px !important;
          }
          .table-card {
            padding: 0 !important;
          }
        }
      `}</style>
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-2 md:p-8 bg-[#FAF8F4]">
          <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-modern text-2xl font-bold text-[#A65F33]">Gestión de Menú</h2>
              <p className="text-sm text-[#A65F33] opacity-70">Administre los platos del restaurante</p>
            </div>
            <Button onClick={handleAddDish} className="add-btn flex items-center gap-2 shadow-flat">
              <Plus className="h-5 w-5" />
              Añadir Nuevo Plato
            </Button>
          </div>

          {/* Stats cards arriba */}
          <div className="stats-grid grid gap-4 md:grid-cols-4">
            {categories.map((category) => {
              const count = menuItems.filter((item) => item.category === category).length
              const available = menuItems.filter((item) => item.category === category && item.available).length
              return (
                <div key={category} className="stats-card p-4 flex flex-col items-center relative">
                  <div className="mb-2 relative z-10 text-[#F68C1F]">{categoryIcons[category]}</div>
                  <span className="stats-title">{category}</span>
                  <p className="mt-1 text-2xl font-bold text-[#F68C1F] relative z-10">{count}</p>
                  <p className="text-xs text-[#7DBB3C] opacity-85 relative z-10 mb-1">
                    {available} disponibles, {count - available} agotados
                  </p>
                  <span className="icon-bg">{categoryIcons[category]}</span>
                </div>
              )
            })}
          </div>

          {/* Tabla con ancho máximo y scroll horizontal */}
          <div className="table-card mb-8 mx-auto" style={{ maxWidth: '1100px', overflowX: 'auto' }}>
            <Table>
              <TableHeader className="table-head-bg">
                <TableRow>
                  <TableHead className="w-[220px] font-modern text-[#A65F33]">Nombre</TableHead>
                  <TableHead className="font-modern text-[#A65F33]">Categoría</TableHead>
                  <TableHead className="font-modern text-[#A65F33]">Precio</TableHead>
                  <TableHead className="font-modern text-[#A65F33]">Estado</TableHead>
                  <TableHead className="text-right font-modern text-[#A65F33]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id} className="table-row-hover transition">
                    <TableCell className="dish-name">
                      {categoryIcons[item.category]}
                      <span>{item.name}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`badge-category ${
                          categoryBadgeColors[item.category] || "bg-[#FFE1C1] text-[#F68C1F]"
                        }`}
                      >
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-[#F68C1F] font-modern">
                      S/ {item.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={item.available} onCheckedChange={() => toggleMenuItemAvailability(item.id)} />
                        <span className={`text-sm font-modern ${item.available ? "estado-true" : "estado-false"}`}>
                          {item.available ? "Disponible" : "Agotado"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="row-actions">
                        <Button variant="ghost" size="icon" onClick={() => handleEditDish(item)} className="rounded-full hover:bg-[#FFA14222]">
                          <Edit2 className="h-5 w-5 text-[#F68C1F]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDish(item.id)}
                          className="rounded-full hover:bg-[#FF704322]"
                        >
                          <Trash2 className="h-5 w-5 text-[#FF7043]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      <DishFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitDish}
        dish={editingDish}
      />
    </div>
  )
}