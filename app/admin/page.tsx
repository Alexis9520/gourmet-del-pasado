"use client";

import { usePOSStore } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Printer, Globe, Database, Moon, Sun, Save, Store, Receipt } from "lucide-react";
import { toast } from "react-hot-toast";
import { useState } from "react";

export default function AdminPage() {
  const { currentUser } = usePOSStore();

  // Mock States for Settings
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "Quantify Gourmet",
    address: "Av. Principal 123, Lima",
    ruc: "20123456789",
    phone: "+51 987 654 321"
  });

  const [systemSettings, setSystemSettings] = useState({
    darkMode: false,
    soundEffects: true,
    printAuto: false,
    igv: 18
  });

  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== "admin") return null;

  const handleSaveGeneral = () => {
    toast.success("Información del restaurante actualizada");
  };

  const handleSaveSystem = () => {
    toast.success("Preferencias del sistema guardadas");
  };

  const handleBackup = () => {
    setBackupStatus("creating");
    setTimeout(() => {
      setBackupStatus("success");
      toast.success("Copia de seguridad creada correctamente");
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-[#FFF5ED]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Settings className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#A65F33]">Configuración del Sistema</h1>
              <p className="text-[#A65F33]/70">Administra las preferencias globales y datos de la empresa.</p>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-white border border-[#FFE0C2] p-1 h-auto rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 w-full md:w-[600px]">
              <TabsTrigger value="general" className="data-[state=active]:bg-[#FFA142] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg py-2.5">
                <Store className="w-4 h-4 mr-2" /> General
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-[#FFA142] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg py-2.5">
                <Globe className="w-4 h-4 mr-2" /> Sistema
              </TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:bg-[#FFA142] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg py-2.5">
                <Database className="w-4 h-4 mr-2" /> Datos
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card className="border-[#FFE0C2] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Datos de la Empresa</CardTitle>
                  <CardDescription>Información que aparecerá en los comprobantes y reportes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Establecimiento</Label>
                      <Input
                        id="name"
                        value={restaurantInfo.name}
                        onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                        className="border-[#FFE0C2] focus:ring-[#FFA142]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ruc">RUC</Label>
                      <Input
                        id="ruc"
                        value={restaurantInfo.ruc}
                        onChange={(e) => setRestaurantInfo({ ...restaurantInfo, ruc: e.target.value })}
                        className="border-[#FFE0C2] focus:ring-[#FFA142]"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Dirección Fiscal</Label>
                      <Input
                        id="address"
                        value={restaurantInfo.address}
                        onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
                        className="border-[#FFE0C2] focus:ring-[#FFA142]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono de Contacto</Label>
                      <Input
                        id="phone"
                        value={restaurantInfo.phone}
                        onChange={(e) => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })}
                        className="border-[#FFE0C2] focus:ring-[#FFA142]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveGeneral} className="bg-[#FFA142] hover:bg-[#FFB167] text-white">
                      <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-[#FFE0C2] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-orange-500" /> Facturación
                    </CardTitle>
                    <CardDescription>Configuración de impuestos y monedas.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Impresión Automática</Label>
                        <p className="text-xs text-gray-500">Imprimir ticket al cerrar venta</p>
                      </div>
                      <Switch
                        checked={systemSettings.printAuto}
                        onCheckedChange={(c) => setSystemSettings({ ...systemSettings, printAuto: c })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IGV / Impuesto (%)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={systemSettings.igv}
                          onChange={(e) => setSystemSettings({ ...systemSettings, igv: Number(e.target.value) })}
                          className="w-24 border-[#FFE0C2]"
                        />
                        <span className="text-sm font-bold text-gray-500">%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#FFE0C2] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" /> Interfaz
                    </CardTitle>
                    <CardDescription>Personaliza la apariencia del sistema.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {systemSettings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-orange-500" />}
                        <div className="space-y-0.5">
                          <Label className="text-base">Modo Oscuro</Label>
                          <p className="text-xs text-gray-500">Cambiar tema de la interfaz</p>
                        </div>
                      </div>
                      <Switch
                        checked={systemSettings.darkMode}
                        onCheckedChange={(c) => setSystemSettings({ ...systemSettings, darkMode: c })}
                      />
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 flex justify-end">
                    <Button onClick={handleSaveSystem} variant="outline" className="text-orange-600 border-orange-200">
                      Guardar Preferencias
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Data Settings */}
            <TabsContent value="data">
              <Card className="border-[#FFE0C2] bg-white shadow-sm border-l-4 border-l-orange-400">
                <CardHeader>
                  <CardTitle>Copias de Seguridad</CardTitle>
                  <CardDescription>Gestiona el respaldo de tu base de datos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-orange-50 p-4 rounded-lg flex items-start gap-4">
                    <Database className="w-10 h-10 text-orange-500 mt-1" />
                    <div>
                      <h4 className="font-bold text-orange-900">Estado del Sistema</h4>
                      <p className="text-sm text-orange-800/80 mb-2">
                        Última copia de seguridad: <span className="font-bold">Hace 2 horas</span>
                      </p>
                      <p className="text-xs text-orange-700">Se recomienda realizar copias al cierre de caja.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleBackup}
                      disabled={backupStatus === 'creating'}
                      className="bg-gray-800 hover:bg-gray-900 text-white"
                    >
                      {backupStatus === 'creating' ? 'Creando respaldo...' : 'Crear Copia Manual'}
                    </Button>
                    <Button variant="outline">Restaurar Copia</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}