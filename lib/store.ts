import { create } from "zustand"

export type TableStatus = "libre" | "ocupado" | "reservado" | "pago pendiente";
export type OrderItemStatus = "pendiente" | "en preparación" | "listo" | "servido" | "cancelado";
export type Site = "polleria" | "restaurante";


export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  image?: string
  available: boolean
  site: Site
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
  status: OrderItemStatus
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
  currentUser: { name: string; role: "admin" | "waiter" | "cashier" | "kitchen"; site: Site } | null
  tables: Table[]
  menuItems: MenuItem[]
  kitchenTickets: KitchenTicket[]
  orderHistory: CompletedOrder[]
  notifications: Notification[]


  // Actions...
  login: (user: { name: string; role: "admin" | "waiter" | "cashier" | "kitchen"; site: Site }) => void
  logout: () => void
  updateTableNotes: (tableId: string, notes: string) => void
  updateTableStatus: (tableId: string, status: TableStatus) => void
  addOrderToTable: (tableId: string, newItems: Omit<OrderItem, "id" | "status">[]) => void
  sendToKitchen: (tableId: string) => void
  markTicketReady: (ticketId: string) => void
  processPayment: (tableId: string, method: string) => CompletedOrder | null
  updateOrderItemStatus: (tableId: string, orderItemId: string, status: OrderItemStatus) => void
  toggleMenuItemAvailability: (itemId: string) => void
  addMenuItem: (item: Omit<MenuItem, "id">) => void
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  requestPayment: (tableId: string) => void;
}

// Mock data
const mockMenuItems: MenuItem[] = [
  // ===== RESTAURANTE =====
  { id: "r1", name: "Ceviche Clásico", category: "Entradas", price: 35, available: true, site: "restaurante" },
  { id: "r2", name: "Causa Limeña", category: "Entradas", price: 28, available: true, site: "restaurante" },
  { id: "r3", name: "Tiradito de Pescado", category: "Entradas", price: 32, available: true, site: "restaurante" },
  { id: "r4", name: "Lomo Saltado", category: "Fondos", price: 45, available: true, site: "restaurante" },
  { id: "r5", name: "Ají de Gallina", category: "Fondos", price: 38, available: true, site: "restaurante" },
  { id: "r6", name: "Arroz con Mariscos", category: "Fondos", price: 48, available: true, site: "restaurante" },
  { id: "r7", name: "Seco de Cordero", category: "Fondos", price: 52, available: true, site: "restaurante" },
  { id: "r8", name: "Chicha Morada", category: "Bebidas", price: 8, available: true, site: "restaurante" },
  { id: "r9", name: "Pisco Sour", category: "Bebidas", price: 22, available: true, site: "restaurante" },
  { id: "r10", name: "Maracuyá Sour", category: "Bebidas", price: 20, available: true, site: "restaurante" },
  { id: "r11", name: "Suspiro Limeño", category: "Postres", price: 18, available: true, site: "restaurante" },
  { id: "r12", name: "Mazamorra Morada", category: "Postres", price: 15, available: true, site: "restaurante" },
  
  // ===== POLLERÍA =====
  { id: "p1", name: "Alitas Broaster", category: "Entradas", price: 18, available: true, site: "polleria" },
  { id: "p2", name: "Anticuchos", category: "Entradas", price: 22, available: true, site: "polleria" },
  { id: "p3", name: "Mollejitas", category: "Entradas", price: 20, available: true, site: "polleria" },
  { id: "p4", name: "Pollo Entero", category: "Fondos", price: 55, available: true, site: "polleria" },
  { id: "p5", name: "1/2 Pollo", category: "Fondos", price: 30, available: true, site: "polleria" },
  { id: "p6", name: "1/4 Pollo", category: "Fondos", price: 18, available: true, site: "polleria" },
  { id: "p7", name: "Salchipapa Personal", category: "Fondos", price: 15, available: true, site: "polleria" },
  { id: "p8", name: "Salchipapa Familiar", category: "Fondos", price: 28, available: true, site: "polleria" },
  { id: "p9", name: "Inca Kola 1.5L", category: "Bebidas", price: 8, available: true, site: "polleria" },
  { id: "p10", name: "Chicha Morada Jarra", category: "Bebidas", price: 10, available: true, site: "polleria" },
  { id: "p11", name: "Cerveza Pilsen", category: "Bebidas", price: 12, available: true, site: "polleria" },
  { id: "p12", name: "Picarones", category: "Postres", price: 12, available: true, site: "polleria" },
]

// Disposición y estado de mesas en el local (adapta x/y/seats según tu plano real)
const mockTables: Table[] = [
  { id: "table-1", number: 1, status: "libre", orders: [], total: 0, x: 40, y: 70, seats: 4 },
  { id: "table-2", number: 2, status: "libre", orders: [], total: 0, x: 180, y: 70, seats: 4 },
  { id: "table-3", number: 3, status: "libre", orders: [], total: 0, x: 40, y: 200, seats: 6 },
  { id: "table-4", number: 4, status: "reservado", orders: [], total: 0, x: 180, y: 200, seats: 6, reservedTime: "19:30" },
  { id: "table-5", number: 5, status: "libre", orders: [], total: 0, x: 320, y: 70, seats: 4 },
  { id: "table-6", number: 6, status: "reservado", orders: [], total: 0, x: 320, y: 200, seats: 4, reservedTime: "18:15" },
  { id: "table-7", number: 7, status: "libre", orders: [], total: 0, x: 40, y: 320, seats: 4 },
  { id: "table-8", number: 8, status: "libre", orders: [], total: 0, x: 180, y: 320, seats: 4 },
  { id: "table-9", number: 9, status: "libre", orders: [], total: 0, x: 320, y: 320, seats: 4 },
  { id: "table-10", number: 10, status: "libre", orders: [], total: 0, x: 440, y: 70, seats: 4 },
  { id: "table-11", number: 11, status: "libre", orders: [], total: 0, x: 440, y: 200, seats: 4 },
  { id: "table-12", number: 12, status: "libre", orders: [], total: 0, x: 440, y: 320, seats: 4 },
]

export const usePOSStore = create<POSState>((set, get) => ({
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

  processPayment: (tableId, method) => {
    const state = get(); // Obtenemos el estado actual
    const tableToProcess = state.tables.find((table) => table.id === tableId);

    if (!tableToProcess || tableToProcess.orders.length === 0) {
      return null; // Si no hay nada que procesar, devolvemos null
    }

    // 1. Crear el registro para el historial
    const newCompletedOrder: CompletedOrder = {
      id: `comp-${Date.now()}`,
      tableNumber: tableToProcess.number,
      waiter: tableToProcess.waiter,
      items: [...tableToProcess.orders],
      total: tableToProcess.total,
      paymentMethod: method,
      completionTime: new Date(),
    };

    // 2. Actualizar el estado del store (como antes)
    set({
      orderHistory: [newCompletedOrder, ...state.orderHistory],
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
    });

    // ✅ 3. Devolvemos el objeto del pedido completado
    return newCompletedOrder;
  },
  requestPayment: (tableId) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId ? { ...table, status: "pago pendiente" } : table
      ),
    })),
  addOrderToTable: (tableId, newItems) =>
    set((state) => {
      const updatedTables = state.tables.map((table) => {
        if (table.id === tableId) {
          const updatedOrders = [...table.orders];

          newItems.forEach((newItem) => {
            // Buscamos si ya existe un item PENDIENTE con el mismo ID de menú y notas
            const existingIndex = updatedOrders.findIndex(
              (o) => o.menuItemId === newItem.menuItemId && o.notes === newItem.notes && o.status === 'pendiente'
            );

            if (existingIndex !== -1) {
              // Si existe y está pendiente, solo aumentamos la cantidad
              updatedOrders[existingIndex].quantity += newItem.quantity;
            } else {
              // Si no existe (o ya no está pendiente), lo añadimos como un nuevo item
              updatedOrders.push({
                ...newItem,
                id: `order-${Date.now()}-${Math.random()}`,
                status: 'pendiente', // ✅ Todo nuevo item entra como 'pendiente'
              });
            }
          });

          const newTotal = updatedOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);

          return {
            ...table,
            orders: updatedOrders,
            total: newTotal,
            status: "ocupado" as TableStatus,
            startTime: table.startTime || new Date(),
            waiter: table.waiter || state.currentUser?.name,
          };
        }
        return table;
      });
      return { tables: updatedTables };
    }),
  // ✅ ¡NUEVA FUNCIÓN ESENCIAL!
  updateOrderItemStatus: (tableId, orderItemId, newStatus) =>
    set((state) => {
      const updatedTables = state.tables.map((table) => {
        if (table.id === tableId) {
          const updatedOrders = table.orders.map((order) => {
            if (order.id === orderItemId) {
              return { ...order, status: newStatus };
            }
            return order;
          });

          // Lógica de notificación cuando un plato está listo
          if (newStatus === 'listo') {
            const order = table.orders.find(o => o.id === orderItemId);
            if (order) {
              const notificationMessage = `${order.quantity}x ${order.name} (Mesa ${table.number}) está listo para servir.`;
              // Llamamos a la acción de notificar de forma segura
              Promise.resolve().then(() => get().addNotification({ message: notificationMessage, type: 'success' }));
            }
          }
          return { ...table, orders: updatedOrders };
        }
        return table;
      });
      return { tables: updatedTables };
    }),
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
  clearAllNotifications: () => set({ notifications: [] }),
}))