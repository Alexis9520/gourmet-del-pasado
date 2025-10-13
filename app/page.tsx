"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePOSStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Usa tu imagen favorita aquí
const IMAGE_URL =
  "https://thumbs.dreamstime.com/b/plato-de-pescado-elegante-almuerzo-del-chef-salm%C3%B3n-gourmet-exclusivo-320234119.jpg"

export default function LoginPage() {
  const router = useRouter()
  const { login, currentUser } = usePOSStore()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "kitchen") {
        router.push("/kitchen")
      } else if (currentUser.role === "cashier") {
        router.push("/cashier")
      }
      else {
        router.push("/tables")
      }
    }
  }, [currentUser, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    const users = {
      admin: { name: "Carlos Admin", role: "admin" as const },
      mesero: { name: "Juan Mesero", role: "waiter" as const },
      cajero: { name: "María Cajera", role: "cashier" as const },
      cocina: { name: "Chef Pedro", role: "kitchen" as const },
    }

    const user = users[username.toLowerCase() as keyof typeof users]
    if (user) {
      login(user)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FFF5ED] flex items-center justify-center px-2">
      <style>{`
        .font-modern {
          font-family: 'Montserrat', 'Poppins', 'Segoe UI', 'sans-serif';
        }
        .input-modern {
          background: #f4efdf;
          border-radius: 12px;
          border: none;
          font-size: 1rem;
          color: #A65F33;
          padding-left: 1rem;
          box-shadow: 0 2px 8px 0 #ffb16711;
          transition: box-shadow 0.2s;
        }
        .input-modern:focus {
          box-shadow: 0 0 0 2px #FFA14244;
          outline: none;
        }
        .btn-modern {
          background: #FFA142;
          color: #fff;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          box-shadow: 0 2px 8px 0 #FFA14233;
          transition: background 0.15s, transform 0.15s;
        }
        .btn-modern:hover {
          background: #FFB167;
          transform: translateY(-2px) scale(1.04);
        }
        .card-shadow {
          box-shadow: 0 4px 24px 0 #ffb16733;
        }
        .divider {
          border: none;
          border-top: 1px solid #FFE0C2;
          margin: 2rem 0 1.5rem 0;
        }
        .login-link {
          color: #FFA142;
          text-decoration: underline;
          cursor: pointer;
        }
        .badge-user {
          background: #FFA142;
          color: #fff;
          font-weight: 600;
          font-size: 0.95em;
          border-radius: 12px;
          padding: 2.5px 14px;
          display: inline-block;
        }
        .test-users-box {
          background: #FFF3E5;
          border: 1px solid #FFE0C2;
          border-radius: 14px;
          padding: 14px 18px;
          margin-top: 12px;
        }
        .icon-bg {
          position: absolute;
          opacity: 0.14;
          pointer-events: none;
          z-index: 0;
        }
        .icon-plate {
          left: -40px;
          top: 220px;
          font-size: 140px;
          color: #fff;
        }
        .icon-leaf {
          right: -34px;
          top: 46px;
          font-size: 80px;
          color: #fff;
        }
        .icon-hat {
          left: 36px;
          bottom: 36px;
          font-size: 70px;
          color: #fff;
        }
        .icon-fork {
          right: 58px;
          bottom: 40px;
          font-size: 84px;
          color: #fff;
        }
        .icon-circle {
          left: 50%;
          bottom: 8px;
          transform: translateX(-50%);
          font-size: 36px;
          color: #FFA142;
          opacity: 0.33;
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 1100px) {
          .login-main {
            max-width: 95vw !important;
          }
        }
        @media (max-width: 900px) {
          .login-main {
            flex-direction: column;
            max-width: 98vw !important;
            min-width: 0 !important;
            width: 100vw !important;
            border-radius: 16px !important;
          }
          .login-left {
            width: 100% !important;
            border-radius: 16px 16px 0 0 !important;
            min-width: 0 !important;
            padding-top: 30px !important;
            padding-bottom: 18px !important;
            height: auto !important;
            align-items: center !important;
          }
          .login-right {
            width: 100% !important;
            border-radius: 0 0 16px 16px !important;
            padding-top: 30px !important;
            padding-bottom: 18px !important;
          }
          .icon-bg {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .login-main {
            max-width: 100vw !important;
            border-radius: 10px !important;
          }
          .login-left {
            padding: 18px 6px !important;
            min-width: 0 !important;
          }
          .login-right {
            padding: 18px 6px !important;
          }
          .test-users-box {
            padding: 10px 8px !important;
          }
        }
      `}</style>
      <div className="relative flex max-w-3xl w-full rounded-2xl card-shadow overflow-hidden bg-[#FFF5ED] login-main">
        {/* Left side: image & logo */}
        <div className="login-left flex flex-col items-center justify-between py-10 px-8 bg-[#FFA142] w-[40%] min-w-[320px] rounded-l-2xl relative">
          {/* Fondo decorativo de iconos SVG */}
          <span className="icon-bg icon-plate" aria-label="plato">
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
              <circle cx="70" cy="70" r="65" stroke="#fff" strokeWidth="8" fill="#fff" />
              <circle cx="70" cy="70" r="35" stroke="#FFA142" strokeWidth="6" fill="none" />
            </svg>
          </span>
          <span className="icon-bg icon-leaf" aria-label="leaf">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path d="M20 65 Q40 25 60 65 Q40 55 20 65" fill="#fff" />
              <path d="M40 65 Q40 45 50 35" stroke="#FFA142" strokeWidth="4" fill="none" />
            </svg>
          </span>
          <span className="icon-bg icon-hat" aria-label="chef hat">
            <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
              <ellipse cx="35" cy="38" rx="28" ry="18" fill="#fff" />
              <rect x="18" y="38" width="34" height="12" rx="6" fill="#FFA142" />
            </svg>
          </span>
          <span className="icon-bg icon-fork" aria-label="fork">
            <svg width="84" height="84" viewBox="0 0 84 84" fill="none">
              <rect x="36" y="18" width="12" height="50" rx="6" fill="#FFA142" />
              <rect x="32" y="8" width="6" height="22" rx="3" fill="#fff" />
              <rect x="46" y="8" width="6" height="22" rx="3" fill="#fff" />
            </svg>
          </span>
          <span className="icon-bg icon-circle">
            <svg width="36" height="36"><circle cx="18" cy="18" r="16" fill="#FFA142" /></svg>
          </span>
          <img
            src={IMAGE_URL}
            alt="Ensalada Quantify Gourmet"
            className="rounded-full w-36 h-36 object-cover border-4 border-[#fff5ed] shadow-xl mb-8 relative z-10"
          />
          <div className="flex flex-col items-center gap-2 mb-4 mt-auto relative z-10">
            <span className="font-modern text-2xl font-extrabold text-white drop-shadow-lg tracking-wide">
              Quantify Gourmet
            </span>
            <span className="font-modern text-base font-medium text-white/80">
            </span>
          </div>
        </div>
        {/* Right side: login */}
        <div className="login-right flex-1 flex flex-col justify-center px-10 py-14 bg-[#FFF5ED] rounded-r-2xl relative">
          {/* Un pequeño icono decorativo arriba */}
          <span className="absolute right-8 top-8 opacity-20 hidden md:inline">
            <svg width="44" height="44"><circle cx="22" cy="22" r="20" fill="#FFA142" /></svg>
          </span>
          <h2 className="font-modern text-2xl md:text-3xl font-bold text-[#A65F33] mb-8 text-center flex items-center justify-center gap-3">
            <svg width="32" height="32" fill="none" aria-label="welcome"><path d="M16 4 L28 18 L16 28 L4 18 Z" fill="#FFA142" /></svg>
            ¡Bienvenido de nuevo!
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full max-w-md mx-auto">
            <div>
              <Label htmlFor="username" className="font-modern text-[#A65F33] text-base mb-1 block flex items-center gap-2">
                <svg width="18" height="18" fill="none" aria-label="user"><circle cx="9" cy="7" r="5" fill="#FFA142" /><rect x="2" y="13" width="14" height="4" rx="2" fill="#FFA142" /></svg>
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-modern h-12 w-full"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="font-modern text-[#A65F33] text-base mb-1 block flex items-center gap-2">
                <svg width="18" height="18" fill="none" aria-label="lock"><rect x="4" y="9" width="10" height="7" rx="2" fill="#FFA142" /><rect x="6" y="5" width="6" height="4" rx="2" fill="#FFA142" /></svg>
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-modern h-12 w-full"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="btn-modern h-12 w-full mt-2 flex items-center justify-center gap-2">
              <svg width="20" height="20" fill="none" aria-label="arrow"><path d="M4 10 H16 M10 4 L16 10 L10 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
              Ingresar
            </Button>
          </form>
          <hr className="divider" />
          <div className="flex justify-center mt-2 mb-2">

          </div>
          <div className="test-users-box w-full max-w-md mx-auto flex flex-col gap-2">
            <p className="font-bold mb-2 text-[#A65F33] font-modern flex gap-2 items-center">
              <svg width="18" height="18" fill="none" aria-label="info"><circle cx="9" cy="9" r="9" fill="#FFA142" /><text x="9" y="13" textAnchor="middle" fontSize="10" fill="#fff">i</text></svg>
              Usuarios de prueba:
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="badge-user">admin</span>
              <span className="badge-user">mesero</span>
              <span className="badge-user">cajero</span>
              <span className="badge-user">cocina</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}