"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { usePOSStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Lock, LogIn, Loader2, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

const IMAGE_URL = "https://thumbs.dreamstime.com/b/plato-de-pescado-elegante-almuerzo-del-chef-salm%C3%B3n-gourmet-exclusivo-320234119.jpg";

export default function LoginPage() {
  const router = useRouter()
  const { login, currentUser } = usePOSStore()
  const [dni, setDni] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (currentUser) {
      const redirectPath =
        currentUser.role === "kitchen" ? "/kitchen" :
          currentUser.role === "cashier" ? "/cashier" :
            currentUser.role === "admin" ? "/dashboard" :
              "/tables";
      router.push(redirectPath);
    }
  }, [currentUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const success = await login(dni, password);

    if (!success) {
      setError("Credenciales incorrectas o error de conexión.");
      setIsLoading(false);
    }
    // Si es success, el useEffect redirigirá
  };



  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1 } },
    shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF5ED] flex items-center justify-center p-4 font-sans">
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col md:flex-row max-w-4xl w-full rounded-2xl shadow-2xl shadow-orange-200/50 overflow-hidden bg-[#FFF5ED]"
      >
        {/* --- Lado Izquierdo: Branding y Imagen --- */}
        <div className="flex flex-col items-center justify-center gap-6 p-8 bg-[#FFA142] text-white w-full md:w-2/5 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
          <motion.img
            src={IMAGE_URL}
            alt="Plato Gourmet"
            className="rounded-full w-40 h-40 object-cover border-4 border-white shadow-xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.2, type: "spring" } }}
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-wide">La Posada</h1>
            <p className="text-white/80 mt-1">Pollería y Restaurante</p>
          </div>
        </div>

        {/* --- Lado Derecho: Formulario de Login --- */}
        <motion.div
          variants={formVariants}
          animate={error ? "shake" : "visible"}
          className="flex-1 flex flex-col justify-center p-8 sm:p-12"
        >
          <h2 className="text-3xl font-bold text-[#A65F33] mb-6">¡Bienvenido de nuevo!</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <motion.div variants={fieldVariants} className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A65F33]/50" />
              <Input
                id="dni" type="text" placeholder="DNI" value={dni}
                onChange={(e) => setDni(e.target.value)} required
                className="h-12 pl-10 text-base border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33] focus:border-[#FFA142] focus:ring-[#FFA142]/50"
              />
            </motion.div>
            <motion.div variants={fieldVariants} className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A65F33]/50" />
              <Input
                id="password" type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="h-12 pl-10 pr-10 text-base border-[#FFE0C2] bg-[#F4EFDF] text-[#A65F33] focus:border-[#FFA142] focus:ring-[#FFA142]/50"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A65F33]/60 hover:text-[#A65F33]">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </motion.div>

            <AnimatePresence>
              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 text-center">{error}</motion.p>}
            </AnimatePresence>

            <motion.div variants={fieldVariants}>
              <Button type="submit" disabled={isLoading} className="h-12 w-full text-base font-semibold bg-[#FFA142] text-white hover:bg-[#FFB167] disabled:bg-orange-300">
                {isLoading ? <Loader2 className="animate-spin" /> : <><LogIn className="mr-2" /> Ingresar</>}
              </Button>
            </motion.div>
          </form>

          {/* --- Acceso Rápido Demo --- */}
          <div className="mt-8 pt-6 border-t border-[#FFE0C2]">
            <p className="text-center text-sm text-[#A65F33]/70 mb-3">Accesos Demo (Pollería)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setDni("11111111"); setPassword("mozo123"); }}
                className="px-2 py-1 bg-[#F4EFDF] border border-[#FFE0C2] rounded text-xs text-[#A65F33] hover:bg-[#FFE0C2] transition-colors"
              >
                Mozo
              </button>
              <button
                type="button"
                onClick={() => { setDni("22222222"); setPassword("caja123"); }}
                className="px-2 py-1 bg-[#F4EFDF] border border-[#FFE0C2] rounded text-xs text-[#A65F33] hover:bg-[#FFE0C2] transition-colors"
              >
                Caja
              </button>
              <button
                type="button"
                onClick={() => { setDni("33333333"); setPassword("cocina123"); }}
                className="px-2 py-1 bg-[#F4EFDF] border border-[#FFE0C2] rounded text-xs text-[#A65F33] hover:bg-[#FFE0C2] transition-colors"
              >
                Cocina
              </button>
            </div>
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => { setDni("12345678"); setPassword("123456"); }}
                className="px-4 py-1 bg-[#FFA142] text-white rounded text-xs hover:bg-[#FFB167] transition-colors font-semibold"
              >
                Admin (Total)
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}