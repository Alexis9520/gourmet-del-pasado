import { redirect } from 'next/navigation'

export default function Page() {
  // Reportes deshabilitados — redirige a la raíz
  redirect('/')
}
