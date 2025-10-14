import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Lato } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import NotificationProvider from "@/components/NotificationProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Quantify Gourmet - Sistema de Gestión de Restaurantes",
  description: "Sistema POS profesional para restaurantes",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} ${lato.variable} antialiased`}>
        

        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <NotificationProvider />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
