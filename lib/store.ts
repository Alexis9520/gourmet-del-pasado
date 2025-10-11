import { create } from "zustand"

export type TableStatus = "libre" | "ocupado" | "reservado"

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  image?: string
  available: boolean
}
export interface CompletedOrder {
  id: string;
  tableNumber: number;
  waiter?: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  completionTime: Date;
}
export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  notes?: string
}

export interface Table {
  id: string
  number: number
  status: TableStatus
  orders: OrderItem[]
  waiter?: string
  startTime?: Date
  total: number
  notes?: string
  // --- NUEVOS CAMPOS ---
  x: number
  y: number
  seats: number
  reservedTime?: string
}

export interface KitchenTicket {
  id: string
  tableNumber: number
  waiter: string
  items: OrderItem[]
  notes?: string
  startTime: Date
  status: "pending" | "ready"
}

export interface Notification {
  id: string
  message: string
  type: "info" | "success" | "warning"
  timestamp: Date
}

interface POSState {
  currentUser: { name: string; role: "admin" | "waiter" | "cashier" | "kitchen" } | null
  tables: Table[]
  menuItems: MenuItem[]
  kitchenTickets: KitchenTicket[]
  orderHistory: CompletedOrder[]
  notifications: Notification[]
  

  // Actions...
  login: (user: { name: string; role: "admin" | "waiter" | "cashier" | "kitchen" }) => void
  logout: () => void
  updateTableNotes: (tableId: string, notes: string) => void
  updateTableStatus: (tableId: string, status: TableStatus) => void
  addOrderToTable: (tableId: string, orders: OrderItem[]) => void
  sendToKitchen: (tableId: string) => void
  markTicketReady: (ticketId: string) => void
  processPayment: (tableId: string, method: string) => void
  toggleMenuItemAvailability: (itemId: string) => void
  addMenuItem: (item: Omit<MenuItem, "id">) => void
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  removeNotification: (id: string) => void
}

// Mock data
const mockMenuItems: MenuItem[] = [
  { id: "1", name: "Ceviche Clásico", category: "Entradas", price: 35, available: true },
  { id: "2", name: "Causa Limeña", category: "Entradas", price: 28, available: true },
  { id: "3", name: "Anticuchos", category: "Entradas", price: 32, available: true },
  { id: "4", name: "Lomo Saltado", category: "Fondos", price: 45, available: true },
  { id: "5", name: "Ají de Gallina", category: "Fondos", price: 38, available: true },
  { id: "6", name: "Arroz con Mariscos", category: "Fondos", price: 48, available: true },
  { id: "7", name: "Chicha Morada", category: "Bebidas", price: 8, available: true },
  { id: "8", name: "Inca Kola", category: "Bebidas", price: 6, available: true },
  { id: "9", name: "Pisco Sour", category: "Bebidas", price: 22, available: true },
  { id: "10", name: "Suspiro Limeño", category: "Postres", price: 18, available: true },
  { id: "11", name: "Mazamorra Morada", category: "Postres", price: 15, available: true },
]

// Disposición y estado de mesas en el local (adapta x/y/seats según tu plano real)
const mockTables: Table[] = [
  { id: "table-1", number: 1, status: "libre", orders: [], total: 0, x: 40, y: 70, seats: 4 },
  { id: "table-2", number: 2, status: "ocupado", orders: [], total: 0, x: 180, y: 70, seats: 4 },
  { id: "table-3", number: 3, status: "libre", orders: [], total: 0, x: 40, y: 200, seats: 6 },
  { id: "table-4", number: 4, status: "reservado", orders: [], total: 0, x: 180, y: 200, seats: 6, reservedTime: "19:30" },
  { id: "table-5", number: 5, status: "ocupado", orders: [], total: 0, x: 320, y: 70, seats: 4 },
  { id: "table-6", number: 6, status: "reservado", orders: [], total: 0, x: 320, y: 200, seats: 4, reservedTime: "18:15" },
  { id: "table-7", number: 7, status: "libre", orders: [], total: 0, x: 40, y: 320, seats: 4 },
  { id: "table-8", number: 8, status: "libre", orders: [], total: 0, x: 180, y: 320, seats: 4 },
  { id: "table-9", number: 9, status: "ocupado", orders: [], total: 0, x: 320, y: 320, seats: 4 },
  { id: "table-10", number: 10, status: "libre", orders: [], total: 0, x: 440, y: 70, seats: 4 },
  { id: "table-11", number: 11, status: "libre", orders: [], total: 0, x: 440, y: 200, seats: 4 },
  { id: "table-12", number: 12, status: "libre", orders: [], total: 0, x: 440, y: 320, seats: 4 },
]

export const usePOSStore = create<POSState>((set) => ({
  currentUser: null,
  tables: mockTables,
  menuItems: mockMenuItems,
  kitchenTickets: [],
  notifications: [],
  orderHistory: [],
  // ...acciones igual que antes
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
  updateTableNotes: (tableId: string, notes: string) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId ? { ...table, notes } : table,
      ),
    })),
  updateTableStatus: (tableId, status) =>
    set((state) => ({
      tables: state.tables.map((table) => (table.id === tableId ? { ...table, status } : table)),
    })),

  processPayment: (tableId, method) =>
    set((state) => {
      const tableToProcess = state.tables.find((table) => table.id === tableId);

      // Si no encontramos la mesa o no tiene items, no hacemos nada
      if (!tableToProcess || tableToProcess.orders.length === 0) {
        return state;
      }

      // 1. Crear el registro para el historial
      const newCompletedOrder: CompletedOrder = {
        id: `completed-${Date.now()}`,
        tableNumber: tableToProcess.number,
        waiter: tableToProcess.waiter,
        items: [...tableToProcess.orders], // Copiamos los items
        total: tableToProcess.total,
        paymentMethod: method,
        completionTime: new Date(),
      };

      // 2. Actualizar el estado
      return {
        // Añadimos el nuevo pedido completado al historial
        orderHistory: [newCompletedOrder, ...state.orderHistory],

        // Limpiamos la mesa como antes
        tables: state.tables.map((table) =>
          table.id === tableId
            ? {
                ...table,
                status: "libre",
                orders: [],
                total: 0,
                startTime: undefined,
                waiter: undefined,
                notes: undefined,
              }
            : table
        ),
      };
    }),
  addOrderToTable: (tableId, orders) =>
    set((state) => ({
      tables: state.tables.map((table) => {
        if (table.id === tableId) {
          const existingOrders = [...table.orders]
          orders.forEach((newOrder) => {
            const existingIndex = existingOrders.findIndex(
              (o) => o.menuItemId === newOrder.menuItemId && o.notes === newOrder.notes,
            )
            if (existingIndex >= 0) {
              existingOrders[existingIndex].quantity += newOrder.quantity
            } else {
              existingOrders.push(newOrder)
            }
          })
          const total = existingOrders.reduce((sum, item) => sum + item.price * item.quantity, 0)
          return {
            ...table,
            orders: existingOrders,
            total,
            status: "ocupado" as TableStatus,
            startTime: table.startTime || new Date(),
            waiter: state.currentUser?.name,
          }
        }
        return table
      }),
    })),
  sendToKitchen: (tableId) =>
    set((state) => {
      const table = state.tables.find((t) => t.id === tableId)
      if (!table || table.orders.length === 0) return state

      const newTicket: KitchenTicket = {
        id: `ticket-${Date.now()}`,
        tableNumber: table.number,
        waiter: table.waiter || "Desconocido",
        items: table.orders,
        notes: table.notes,
        startTime: new Date(),
        status: "pending",
      }

      return {
        kitchenTickets: [...state.kitchenTickets, newTicket],
      }
    }),
  markTicketReady: (ticketId) =>
    set((state) => {
      const ticket = state.kitchenTickets.find((t) => t.id === ticketId)
      if (!ticket) return state

      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        message: `Mesa ${ticket.tableNumber} - Pedido listo para servir`,
        type: "success",
        timestamp: new Date(),
      }

      return {
        kitchenTickets: state.kitchenTickets.filter((t) => t.id !== ticketId),
        notifications: [...state.notifications, newNotification],
      }
    }),
  toggleMenuItemAvailability: (itemId) =>
    set((state) => ({
      menuItems: state.menuItems.map((item) => (item.id === itemId ? { ...item, available: !item.available } : item)),
    })),
  addMenuItem: (item) =>
    set((state) => ({
      menuItems: [
        ...state.menuItems,
        {
          ...item,
          id: `item-${Date.now()}`,
        },
      ],
    })),
  updateMenuItem: (id, updates) =>
    set((state) => ({
      menuItems: state.menuItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })),
  deleteMenuItem: (id) =>
    set((state) => ({
      menuItems: state.menuItems.filter((item) => item.id !== id),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: `notif-${Date.now()}`,
          timestamp: new Date(),
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))