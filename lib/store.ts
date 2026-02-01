import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TableStatus = "libre" | "ocupado" | "reservado" | "pago pendiente";
export type OrderItemStatus = "pendiente" | "en preparación" | "listo" | "servido" | "cancelado";
export type Site = "polleria" | "restaurante";
export type OrderType = "mesa" | "para-llevar" | "delivery";


export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  image?: string
  available: boolean
  sites: Site[] // Changed from site: Site to sites: Site[]
}

export interface Menu {
  id: string;
  name: string; // e.g., "Menú Lunes", "Menú Verano"
  startDate?: string; // ISO Date string for serialization
  endDate?: string;
  isActive: boolean;
  items: string[]; // List of MenuItem IDs (Used for daily/special or as fallback)
  weeklyItems?: Record<string, string[]>; // { "monday": ["id1", "id2"], "tuesday": [] }
  type: "daily" | "weekly" | "special";
}
export interface CompletedOrder {
  id: string;
  tableNumber: number;
  waiter?: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  completionTime: Date;
  orderType: OrderType;
  amountPaid?: number;
  change?: number;
}
export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  notes?: string
  status: OrderItemStatus
  orderType: OrderType // ✅ Cada item tiene su propio tipo de pedido
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
  orderType?: OrderType
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
  site: Site // Identifica a qué cocina pertenece el ticket
}

export interface Notification {
  id: string
  message: string
  type: "info" | "success" | "warning"
  timestamp: Date
}

export interface CashSession {
  id: string;
  isOpen: boolean;
  startTime: Date;
  endTime?: Date;
  startAmount: number;
  salesTotal: number;
  endAmount?: number; // Reported by user
  difference?: number; // endAmount - (startAmount + salesTotal)
  notes?: string;
  user: string; // Who opened/closed it
}

interface POSState {
  currentUser: {
    id: string;
    dni: string;
    name: string;
    role: "admin" | "waiter" | "cashier" | "kitchen";
    site: Site;
    token?: string;
    refreshToken?: string; // New
    expiresIn?: number; // New
  } | null
  tables: Table[]
  menuItems: MenuItem[]
  kitchenTickets: KitchenTicket[]
  orderHistory: CompletedOrder[]
  notifications: Notification[]
  menus: Menu[]
  cashSession: CashSession | null
  cashSessions: CashSession[]




  // Actions...
  login: (dni: string, password: string) => Promise<boolean>
  logout: () => Promise<void> // Changed to async
  refreshSession: () => Promise<boolean> // New Action
  updateTableNotes: (tableId: string, notes: string) => void
  updateTableStatus: (tableId: string, status: TableStatus) => void
  addOrderToTable: (tableId: string, newItems: Omit<OrderItem, "id" | "status">[], orderType?: OrderType) => void
  sendToKitchen: (tableId: string) => void
  markTicketReady: (ticketId: string) => void
  processPayment: (tableId: string, method: string, amountPaid?: number) => CompletedOrder | null
  updateOrderItemStatus: (tableId: string, orderItemId: string, status: OrderItemStatus) => void
  toggleMenuItemAvailability: (itemId: string) => void
  addMenuItem: (item: Omit<MenuItem, "id">) => void
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  requestPayment: (tableId: string) => void;
  // Layout Actions
  updateTablePosition: (tableId: string, x: number, y: number) => void;
  addTable: (table: Omit<Table, "id" | "status" | "orders" | "total">) => void;
  deleteTable: (tableId: string) => void;
  updateTableSeats: (tableId: string, seats: number) => void;
  resetTablePositions: () => void;
  // Menu Actions
  addMenu: (menu: Omit<Menu, "id">) => void;
  updateMenu: (id: string, menu: Partial<Menu>) => void;
  deleteMenu: (id: string) => void;
  // Cash Actions
  openRegister: (amount: number, user: string) => void;
  closeRegister: (endAmount: number, notes: string) => void;
  registerSale: (amount: number) => void;
  // Products Actions
  fetchProducts: () => Promise<void>;
}

// Mock data
const mockMenuItems: MenuItem[] = [
  // ===== POLLERÍA =====
  // Pollos a la brasa
  { id: "pol1", name: "Pollo Entero a la Brasa", category: "Pollos a la brasa", price: 55, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1000" },
  { id: "pol2", name: "1/2 Pollo a la Brasa", category: "Pollos a la brasa", price: 30, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=1000" },
  { id: "pol3", name: "1/4 Pollo a la Brasa", category: "Pollos a la brasa", price: 18, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=1000" },
  { id: "pol4", name: "Combo Familiar (Pollo + Papas + Ensalada)", category: "Pollos a la brasa", price: 68, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=1000" },
  { id: "pol5", name: "Pollo con Papas y Gaseosa", category: "Pollos a la brasa", price: 35, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000" },

  // Parrillas
  { id: "par1", name: "Parrilla Mixta Personal", category: "Parrillas", price: 42, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000" },
  { id: "par2", name: "Parrilla Mixta Familiar", category: "Parrillas", price: 85, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000" },
  { id: "par3", name: "Anticuchos de Corazón", category: "Parrillas", price: 25, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000" }, // Placeholder for Anticuchos
  { id: "par4", name: "Chorizo Parrillero", category: "Parrillas", price: 22, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1595475207225-428b62bda831?q=80&w=1000" },
  { id: "par5", name: "Mollejitas a la Parrilla", category: "Parrillas", price: 20, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=1000" },
  { id: "par6", name: "Costillas BBQ", category: "Parrillas", price: 38, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000" },

  // Gaseosas (Compartidas)
  { id: "gas1", name: "Inca Kola 1.5L", category: "Gaseosas", price: 8, available: true, sites: ["polleria", "restaurante"], image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000" },
  { id: "gas2", name: "Coca Cola 1.5L", category: "Gaseosas", price: 8, available: true, sites: ["polleria", "restaurante"], image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000" },
  { id: "gas3", name: "Inca Kola Personal", category: "Gaseosas", price: 4, available: true, sites: ["polleria", "restaurante"], image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=1000" },
  { id: "gas4", name: "Coca Cola Personal", category: "Gaseosas", price: 4, available: true, sites: ["polleria", "restaurante"], image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=1000" },
  { id: "gas5", name: "Sprite 1.5L", category: "Gaseosas", price: 8, available: true, sites: ["polleria", "restaurante"], image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=1000" },

  // Chaufas
  { id: "cha1", name: "Chaufa de Pollo", category: "Chaufas", price: 28, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1000" },
  { id: "cha2", name: "Chaufa de Carne", category: "Chaufas", price: 32, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1000" },
  { id: "cha3", name: "Chaufa Mixto", category: "Chaufas", price: 35, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1000" },
  { id: "cha4", name: "Chaufa de Mariscos", category: "Chaufas", price: 42, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000" },
  { id: "cha5", name: "Chaufa Especial de la Casa", category: "Chaufas", price: 45, available: true, sites: ["polleria"], image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1000" },

  // ===== RESTAURANTE =====
  // Segundos
  { id: "seg1", name: "Lomo Saltado", category: "Segundos", price: 35, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1000" },
  { id: "seg2", name: "Ají de Gallina", category: "Segundos", price: 28, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000" },
  { id: "seg3", name: "Seco de Res", category: "Segundos", price: 32, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000" }, // Placeholder
  { id: "seg4", name: "Tacu Tacu con Bistec", category: "Segundos", price: 38, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1000" },
  { id: "seg5", name: "Arroz con Pollo", category: "Segundos", price: 25, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=1000" },
  { id: "seg6", name: "Cau Cau", category: "Segundos", price: 30, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000" },

  // Sopas
  { id: "sop1", name: "Sopa Criolla", category: "Sopas", price: 15, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1547592166-23acbe54099c?q=80&w=1000" },
  { id: "sop2", name: "Chupe de Camarones", category: "Sopas", price: 45, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=1000" },
  { id: "sop3", name: "Parihuela", category: "Sopas", price: 42, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1547592166-23acbe54099c?q=80&w=1000" },
  { id: "sop4", name: "Aguadito de Pollo", category: "Sopas", price: 18, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=1000" },
  { id: "sop5", name: "Sopa Teóloga", category: "Sopas", price: 22, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1547592166-23acbe54099c?q=80&w=1000" },

  // Licores (Compartidos la mayoría)
  { id: "lic1", name: "Pisco Sour Clásico", category: "Licores", price: 22, available: true, sites: ["restaurante", "polleria"], image: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=1000" },
  { id: "lic2", name: "Chilcano de Pisco", category: "Licores", price: 18, available: true, sites: ["restaurante", "polleria"], image: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=1000" },
  { id: "lic3", name: "Algarrobina", category: "Licores", price: 20, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=1000" },
  { id: "lic4", name: "Cerveza Cristal", category: "Licores", price: 12, available: true, sites: ["restaurante", "polleria"], image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=1000" },
  { id: "lic5", name: "Cerveza Pilsen", category: "Licores", price: 12, available: true, sites: ["restaurante", "polleria"], image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=1000" },
  { id: "lic6", name: "Copa de Vino Tinto", category: "Licores", price: 25, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000" },

  // Gaseosas (Restaurante - adicionales si hubieran diferentes, pero usamos las compartidas arriba)
  { id: "gas6", name: "Chicha Morada Jarra", category: "Gaseosas", price: 12, available: true, sites: ["restaurante", "polleria"], image: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=1000" },
  { id: "gas7", name: "Limonada Frozen", category: "Gaseosas", price: 10, available: true, sites: ["restaurante", "polleria"], image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000" },
  { id: "gas8", name: "Maracuyá Sour (Sin Alcohol)", category: "Gaseosas", price: 8, available: true, sites: ["restaurante"], image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000" },
]

// Mock data
// Helper para grid 5xN
const getGridPosition = (index: number) => {
  const cols = 5;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return { x: col * 220 + 20, y: row * 220 + 120 }; // Offset Y para evitar solapamiento
};

const mockTables: Table[] = Array.from({ length: 15 }, (_, i) => {
  const { x, y } = getGridPosition(i);
  return {
    id: `table-${i + 1}`,
    number: i + 1,
    status: "libre",
    orders: [],
    total: 0,
    x,
    y,
    seats: 4, // Default seats
  };
});

const mockAuthUsers = [
  { dni: "11111111", password: "mozo123", name: "Juan Pérez", role: "waiter", site: "polleria", id: "019c1099-7e5e-773d-bbaa-3794d4b446e6" },
  { dni: "22222222", password: "caja123", name: "María López", role: "cashier", site: "polleria", id: "019c1099-eb4f-7c71-a748-6871432111cf" },
  { dni: "33333333", password: "cocina123", name: "Pedro García", role: "kitchen", site: "polleria", id: "019c1099-f92d-7782-accc-7e1f1ea2ac16" },
  { dni: "44444444", password: "mozo123", name: "Juan Pérez", role: "waiter", site: "restaurante", id: "019c109a-bb22-7d5c-8903-422a65880430" },
  { dni: "55555555", password: "caja123", name: "María López", role: "cashier", site: "restaurante", id: "019c109a-cba4-7fca-95a4-f3d83f66f204" },
  { dni: "55555555", password: "caja123", name: "María López", role: "cashier", site: "restaurante", id: "019c109a-cba4-7fca-95a4-f3d83f66f204" },
  { dni: "66666666", password: "cocina123", name: "Pedro García", role: "kitchen", site: "restaurante", id: "019c109a-d87b-7a1b-b9c2-bd6abe97f80a" },
  { dni: "12345678", password: "123456", name: "Admin Sistema", role: "admin", site: "polleria", id: "admin-demo-id" },
] as const;

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      tables: mockTables,
      menuItems: [], // Will be loaded from backend
      kitchenTickets: [],
      notifications: [],
      menus: [], // Initial empty state for menus
      orderHistory: [],
      cashSession: null,
      cashSessions: [],

      login: async (dni, password) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni, password }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Login failed:", response.status, errorText);
            throw new Error("Credenciales inválidas");
          }

          const data = await response.json();

          let role: "admin" | "waiter" | "cashier" | "kitchen" = "waiter";
          if (data.rol === "ADMIN_SISTEMA" || data.rol === "ADMIN_SEDE" || data.rol === "ADMINISTRADOR") role = "admin";
          else if (data.rol === "MOZO") role = "waiter";
          else if (data.rol === "CAJERO" || data.rol === "CAJA") role = "cashier";
          else if (data.rol === "COCINERO" || data.rol === "COCINA") role = "kitchen";

          // Determine site from sedeNombre
          let site: Site = "restaurante";
          if (data.sedeNombre) {
            const sedeName = data.sedeNombre.toLowerCase();
            if (sedeName.includes("pollería") || sedeName.includes("polleria")) {
              site = "polleria";
            }
          }

          const user = {
            id: data.userId,
            dni: data.dni,
            name: data.nombreCompleto || data.username,
            role: role,
            site: site,
            token: data.token,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('refresh_token', data.refreshToken);
          }

          set({ currentUser: user });
          
          // Fetch products after login
          try {
            await get().fetchProducts();
          } catch (err) {
            console.error("Error fetching products after login:", err);
            // Continue even if products fail to load
          }
          
          return true;
        } catch (error) {
          console.error("Login Error:", error);
          return false;
        }
      },

      logout: async () => {
        const currentUser = get().currentUser;
        if (currentUser?.token) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${currentUser.token}`
              }
            });
          } catch (error) {
            console.error("Error al cerrar sesión en backend:", error);
          }
        }

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }

        // Reset to initial state
        set({ 
          currentUser: null,
          menuItems: [],
          kitchenTickets: [],
          notifications: [],
          cashSession: null
        });

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },

      refreshSession: async () => {
        const currentUser = get().currentUser;
        if (!currentUser?.refreshToken) return false;

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: currentUser.refreshToken })
          });

          if (!response.ok) throw new Error("Refresh failed");

          const data = await response.json();

          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('refresh_token', data.refreshToken);
          }

          set((state) => ({
            currentUser: state.currentUser ? {
              ...state.currentUser,
              token: data.token,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn
            } : null
          }));
          return true;

        } catch (error) {
          console.error("Session refresh error:", error);
          get().logout();
          return false;
        }
      },

      updateTableNotes: (tableId, notes) =>
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId ? { ...table, notes } : table,
          ),
        })),

      updateTableStatus: (tableId, status) =>
        set((state) => ({
          tables: state.tables.map((table) => (table.id === tableId ? { ...table, status } : table)),
        })),

      processPayment: (tableId, method, amountPaid) => {
        const state = get();
        const table = state.tables.find((t) => t.id === tableId);
        if (!table) return null;

        const change = amountPaid ? amountPaid - table.total : 0;

        const completedOrder: CompletedOrder = {
          id: `order-${Date.now()}`,
          tableNumber: table.number,
          waiter: table.waiter,
          items: table.orders,
          total: table.total,
          paymentMethod: method,
          completionTime: new Date(),
          orderType: table.orderType || "mesa",
          amountPaid: amountPaid || table.total,
          change: change > 0 ? change : 0
        };

        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId
              ? { ...t, status: "libre", orders: [], total: 0, waiter: undefined, notes: undefined, orderType: undefined, startTime: undefined }
              : t
          ),
          orderHistory: [...state.orderHistory, completedOrder],
          // Hook into Cash Session
          cashSession: state.cashSession ? {
            ...state.cashSession,
            salesTotal: state.cashSession.salesTotal + (amountPaid || table.total)
          } : state.cashSession
        }));
        return completedOrder;
      },

      requestPayment: (tableId) =>
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId ? { ...table, status: "pago pendiente" } : table
          ),
        })),

      addOrderToTable: (tableId, newItems, orderType) =>
        set((state) => {
          const updatedTables = state.tables.map((table) => {
            if (table.id === tableId) {
              const updatedOrders = [...table.orders];

              newItems.forEach((newItem) => {
                const existingIndex = updatedOrders.findIndex(
                  (o) => o.menuItemId === newItem.menuItemId && o.notes === newItem.notes && o.status === 'pendiente'
                );

                if (existingIndex !== -1) {
                  updatedOrders[existingIndex].quantity += newItem.quantity;
                } else {
                  updatedOrders.push({
                    ...newItem,
                    id: `order-${Date.now()}-${Math.random()}`,
                    status: 'pendiente',
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
                orderType: orderType || table.orderType || "mesa",
              };
            }
            return table;
          });

          const result = { tables: updatedTables };

          Promise.resolve().then(() => {
            const storeState = get();
            storeState.sendToKitchen(tableId);
          });

          return result;
        }),

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

              if (newStatus === 'listo') {
                const order = table.orders.find(o => o.id === orderItemId);
                if (order) {
                  const notificationMessage = `${order.quantity}x ${order.name} (Mesa ${table.number}) está listo para servir.`;
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

          const pendingItems = table.orders.filter(item => item.status === 'pendiente')
          if (pendingItems.length === 0) return state

          const itemsBySite = new Map<Site, OrderItem[]>()
          const currentUser = state.currentUser;

          pendingItems.forEach(orderItem => {
            const menuItem = state.menuItems.find(mi => mi.id === orderItem.menuItemId)
            if (menuItem) {
              let targetSite: Site = menuItem.sites[0];

              if (menuItem.sites.length > 1 && currentUser?.site && menuItem.sites.includes(currentUser.site)) {
                targetSite = currentUser.site;
              }

              if (!itemsBySite.has(targetSite)) {
                itemsBySite.set(targetSite, [])
              }
              itemsBySite.get(targetSite)!.push(orderItem)
            }
          })

          const newTickets: KitchenTicket[] = []
          itemsBySite.forEach((items, site) => {
            newTickets.push({
              id: `ticket-${Date.now()}-${site}-${Math.random()}`,
              tableNumber: table.number,
              waiter: table.waiter || "Desconocido",
              items: items,
              notes: table.notes,
              startTime: new Date(),
              status: "pending",
              site: site
            })
          })

          const updatedTables = state.tables.map(t => {
            if (t.id === tableId) {
              return {
                ...t,
                orders: t.orders.map(order => {
                  if (order.status === 'pendiente') {
                    return { ...order, status: 'en preparación' as OrderItemStatus }
                  }
                  return order
                })
              }
            }
            return t
          })

          return {
            kitchenTickets: [...state.kitchenTickets, ...newTickets],
            tables: updatedTables,
            notifications: [
              ...state.notifications,
              {
                id: `notif-${Date.now()}`,
                message: `Pedido para Mesa ${table.number} enviado a cocina.`,
                type: "success",
                timestamp: new Date(),
              },
            ],
          }
        }),

      markTicketReady: (ticketId) =>
        set((state) => ({
          kitchenTickets: state.kitchenTickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status: "ready" } : ticket
          ),
        })),

      updateTablePosition: (tableId, x, y) => set((state) => ({
        tables: state.tables.map((t) => t.id === tableId ? { ...t, x, y } : t)
      })),

      addTable: (newTableData) => set((state) => {
        const newId = `table-${Date.now()}`;
        const newTable: Table = {
          id: newId,
          status: "libre",
          orders: [],
          total: 0,
          ...newTableData
        };
        return { tables: [...state.tables, newTable] };
      }),

      deleteTable: (tableId) => set((state) => ({
        tables: state.tables.filter((t) => t.id !== tableId)
      })),

      updateTableSeats: (tableId, seats) => set((state) => ({
        tables: state.tables.map((t) => t.id === tableId ? { ...t, seats: Math.max(1, seats) } : t)
      })),

      resetTablePositions: () => set((state) => {
        const sortedTables = [...state.tables].sort((a, b) => a.number - b.number);
        const updatedTables = sortedTables.map((table, index) => {
          const { x, y } = getGridPosition(index);
          return { ...table, x, y };
        });
        return { tables: updatedTables };
      }),

      toggleMenuItemAvailability: (itemId) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === itemId ? { ...item, available: !item.available } : item
          ),
        })),

      addMenuItem: (item) =>
        set((state) => ({
          menuItems: [...state.menuItems, { ...item, id: Math.random().toString(36).substr(2, 9) }],
        })),

      updateMenuItem: (id, item) =>
        set((state) => ({
          menuItems: state.menuItems.map((i) => (i.id === id ? { ...i, ...item } : i)),
        })),

      deleteMenuItem: (id) =>
        set((state) => ({
          menuItems: state.menuItems.filter((i) => i.id !== id),
        })),

      addNotification: (notification) =>
        set((state) => {
          // Evitar notificaciones duplicadas por mensaje+tipo
          const exists = state.notifications.some(n => n.message === notification.message && n.type === notification.type)
          if (exists) return state
          return {
            notifications: [
              { ...notification, id: Math.random().toString(36).substr(2, 9), timestamp: new Date() },
              ...state.notifications,
            ],
          }
        }),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAllNotifications: () => set({ notifications: [] }),

      // Menu Actions Implementation
      addMenu: (menu) => set((state) => ({
        menus: [...state.menus, { ...menu, id: Math.random().toString(36).substr(2, 9) }]
      })),

      updateMenu: (id, menu) => set((state) => ({
        menus: state.menus.map((m) => (m.id === id ? { ...m, ...menu } : m))
      })),

      deleteMenu: (id) => set((state) => ({
        menus: state.menus.filter((m) => m.id !== id)
      })),

      // Cash Actions
      openRegister: (amount, user) => set((state) => ({
        cashSession: {
          id: `session-${Date.now()}`,
          isOpen: true,
          startTime: new Date(),
          startAmount: amount,
          salesTotal: 0,
          user: user
        }
      })),

      closeRegister: (endAmount, notes) => set((state) => {
        if (!state.cashSession) return state;
        const expected = state.cashSession.startAmount + state.cashSession.salesTotal;
        const closed = {
          ...state.cashSession,
          isOpen: false,
          endTime: new Date(),
          endAmount,
          difference: endAmount - expected,
          notes
        } as CashSession;

        return {
          cashSession: null,
          cashSessions: [...(state.cashSessions || []), closed]
        };
      }),

      registerSale: (amount) => set((state) => ({
        cashSession: state.cashSession ? {
          ...state.cashSession,
          salesTotal: state.cashSession.salesTotal + amount
        } : null,
        // keep history unchanged
      })),

      fetchProducts: async () => {
        const currentUser = get().currentUser;
        const token = currentUser?.token;
        
        if (!token) {
          console.warn("fetchProducts: No token available.");
          throw new Error("No hay sesión activa. Por favor, inicia sesión nuevamente.");
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          if (response.status === 403) {
            console.error("Access forbidden. Token might be expired or invalid.");
            throw new Error("Acceso denegado. Tu sesión puede haber expirado. Por favor, inicia sesión nuevamente.");
          }

          if (response.status === 401) {
            console.error("Unauthorized. User not authenticated.");
            throw new Error("No autorizado. Por favor, inicia sesión.");
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error fetching products: ${response.status} - ${errorText}`);
            throw new Error(`Error al cargar productos: ${response.status}`);
          }

          const productos = await response.json();

          const mappedItems: MenuItem[] = productos.map((p: any) => {
            let sites: Site[] = ["polleria", "restaurante"]; // Default: available on all sites if null
            if (p.sedeCocinaNombre) {
              const sedeNombre = p.sedeCocinaNombre.toLowerCase();
              if (sedeNombre.includes("pollería") || sedeNombre.includes("polleria")) {
                sites = ["polleria"];
              } else if (sedeNombre.includes("restaurante") || sedeNombre.includes("sala")) {
                sites = ["restaurante"];
              }
            }

            // Normalize category to Title Case (handling backend UPPERCASE enums)
            const categoryMap: Record<string, string> = {
              'POLLOS': 'Pollos a la brasa',
              'PARRILLAS': 'Parrillas',
              'CHAUFAS': 'Chaufas',
              'SEGUNDOS': 'Segundos',
              'SOPAS': 'Sopas',
              'LICORES': 'Licores',
              'GASEOSAS': 'Gaseosas',
              'REFRESCOS': 'Bebidas',
              'COMBOS': 'Combos',
              'MATES': 'Bebidas'
            };

            const rawCategory = p.categoria || "ELABORADO";
            const category = categoryMap[rawCategory] || rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();

            return {
              id: p.id,
              name: p.nombre,
              category: category,
              price: p.precioVenta || 0,
              image: p.imagenUrl || undefined,
              available: p.activo ?? true,
              sites: sites
            };
          });

          set({ menuItems: mappedItems });
          console.log(`Fetched ${mappedItems.length} products from API.`);
        } catch (error) {
          console.error("Error fetching products:", error);
          // Re-throw error so the UI can handle it
          throw error;
        }
      },

    }),
    {
      name: 'pos-storage',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
)