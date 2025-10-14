"use client"



import { useEffect, useMemo, useRef } from "react"

import { useRouter } from "next/navigation"

import { motion, AnimatePresence } from "framer-motion"

import useSound from 'use-sound'

import { usePOSStore, OrderItem } from "@/lib/store"

import { Header } from "@/components/header"

import { KitchenTicketCard } from "@/components/kitchen-ticket-card"

import { ChefHat } from "lucide-react"



// ✅ --- HOOK usePrevious CORREGIDO ---

function usePrevious<T>(value: T): T | undefined {

  // El ref se inicializa con `undefined` para satisfacer a TypeScript.

  const ref = useRef<T | undefined>(undefined);

 

  useEffect(() => {

    ref.current = value;

  }, [value]);

 

  return ref.current;

}



// ✨ Definimos la nueva estructura de una "comanda" para la cocina

interface KitchenComanda {

  tableId: string;

  tableNumber: number;

  waiter: string;

  startTime: Date;

  items: OrderItem[];

}



export default function KitchenPage() {

  const router = useRouter()

  // ✨ Leemos 'tables' en lugar de 'kitchenTickets'

  const { currentUser, tables } = usePOSStore()



  // ✨ --- LÓGICA PRINCIPAL DE TRANSFORMACIÓN DE DATOS ---

  // Usamos useMemo para evitar recalcular esto en cada render, solo cuando las mesas cambien.

  const kitchenComandas: KitchenComanda[] = useMemo(() => {

    const comandasAgrupadas: { [tableId: string]: KitchenComanda } = {};



    tables.forEach(table => {

      // Filtramos solo los items que le importan a la cocina

      const itemsParaCocina = table.orders.filter(

        order => order.status === 'pendiente' || order.status === 'en preparación'

      );



      // Si hay items para esta mesa, los agrupamos

      if (itemsParaCocina.length > 0) {

        if (!comandasAgrupadas[table.id]) {

          comandasAgrupadas[table.id] = {

            tableId: table.id,

            tableNumber: table.number,

            waiter: table.waiter || 'N/A',

            startTime: table.startTime || new Date(),

            items: []

          };

        }

        comandasAgrupadas[table.id].items.push(...itemsParaCocina);

      }

    });



    // Convertimos el objeto agrupado en un array y lo ordenamos por la hora de inicio

    return Object.values(comandasAgrupadas)

      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  }, [tables]);



  const prevComandaCount = usePrevious(kitchenComandas.length);

  const [playNotification] = useSound('/notification.mp3');



  useEffect(() => {

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'kitchen')) {

      router.push("/")

    }

  }, [currentUser, router]);



  useEffect(() => {

    // ✨ Actualizamos la lógica para usar la nueva data

    const pendingItemsCount = kitchenComandas.reduce((sum, comanda) => sum + comanda.items.length, 0);



    if (pendingItemsCount > 0) {

      document.title = `(${pendingItemsCount}) Pedidos - Quantify Gourmet`;

    } else {

      document.title = "Cocina - Quantify Gourmet";

    }



    if (prevComandaCount !== undefined && kitchenComandas.length > prevComandaCount) {

      playNotification();

    }

  }, [kitchenComandas, prevComandaCount, playNotification]);



  if (!currentUser) return null



  return (

    <div className="flex h-screen bg-[#FFF5ED] font-sans">

      <div className="flex flex-1 flex-col">

        <Header />

        <main className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">

          <div className="mb-6 shrink-0">

            <h2 className="text-3xl font-bold text-[#A65F33]">Pedidos en Cocina</h2>

            <p className="text-base text-[#A65F33]/70">

              {/* ✨ Actualizamos los textos */}

              {kitchenComandas.length > 0

                ? `${kitchenComandas.length} mesas con pedidos activos.`

                : "Todo está al día. ¡Buen trabajo!"}

            </p>

          </div>

          <div className="flex-1 overflow-x-auto pb-4">

            <AnimatePresence>

              {kitchenComandas.length === 0 ? (

                <motion.div key="empty-state" /* ... (sin cambios) ... */ >

                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF3E5]">

                      <ChefHat size={60} className="text-[#FFA142]" />

                    </div>

                    <p className="mt-4 text-xl font-bold text-[#A65F33]">¡Cocina Limpia!</p>

                    <p className="max-w-xs text-[#A65F33]/70">Los nuevos pedidos aparecerán aquí en tiempo real.</p>

                </motion.div>

              ) : (

                <motion.div className="flex h-full items-start gap-6">

                  {/* ✨ Mapeamos sobre la nueva data 'kitchenComandas' */}

                  {kitchenComandas.map((comanda) => (

                    <motion.div

                      key={comanda.tableId} // ✨ Usamos tableId como key

                      layout

                      initial={{ opacity: 0, x: 100 }}

                      animate={{ opacity: 1, x: 0 }}

                      exit={{ opacity: 0, scale: 0.8 }}

                      transition={{ type: "spring", stiffness: 250, damping: 25 }}

                      className="w-80 shrink-0"

                    >

                      {/* ✨ Pasamos 'comanda' y 'tableId' al componente hijo */}

                      <KitchenTicketCard comanda={comanda} />

                    </motion.div>

                  ))}

                </motion.div>

              )}

            </AnimatePresence>

          </div>

        </main>

      </div>

    </div>

  )

}