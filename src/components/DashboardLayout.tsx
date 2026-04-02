import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { logoutUser, getUser, loginUser } from "@/lib/auth";
import { toast } from "sonner";
import {
  LayoutDashboard, Package, Monitor, ShoppingCart, MonitorSmartphone,
  CalendarDays, CalendarRange, Calendar, LogOut, Menu, X, Zap, ChevronDown,
  User, Plus, History, ClipboardList, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const navItems = [
  { label: "Panel principal", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Nuevo producto", icon: Package, path: "/dashboard/new-product" },
  { label: "Nuevo servicio digital", icon: Monitor, path: "/dashboard/new-service" },
  { label: "Productos disponibles", icon: ClipboardList, path: "/dashboard/available-products" },
  { label: "Servicios digitales disponibles", icon: ClipboardList, path: "/dashboard/available-services" },
  { label: "Nueva venta de producto", icon: Plus, path: "/dashboard/new-product-sale" },
  { label: "Nueva venta de servicio digital", icon: Plus, path: "/dashboard/new-service-sale" },
  { label: "Productos vendidos", icon: ShoppingCart, path: "/dashboard/product-sales" },
  { label: "Servicios digitales vendidos", icon: MonitorSmartphone, path: "/dashboard/service-sales" },
  { label: "Reporte mensual", icon: CalendarDays, path: "/dashboard/report-monthly" },
  { label: "Reporte semanal", icon: CalendarRange, path: "/dashboard/report-weekly" },
  { label: "Reporte anual", icon: Calendar, path: "/dashboard/report-annual" },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "", currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const handleLogout = () => {
    logoutUser();
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  const handleSaveProfile = () => {
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (user) {
      loginUser({ ...user, name: profileForm.name });
      toast.success("Perfil actualizado");
    }
    setShowProfile(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-14'} bg-card border-r border-border transition-all duration-300 flex flex-col fixed md:relative h-screen z-40 overflow-hidden`}>
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
          <Zap className="h-5 w-5 text-primary shrink-0" />
          {sidebarOpen && <span className="font-bold text-foreground text-sm whitespace-nowrap">Control de ventas</span>}
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); if (window.innerWidth < 768) setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-xs transition-colors ${active ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 shrink-0">
          <button onClick={() => setShowLogout(true)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-xl sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.name || "Usuario"}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem onClick={() => setShowProfile(true)} className="text-foreground">
                <Settings className="h-4 w-4 mr-2" /> Modificar usuario
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => setShowLogout(true)} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Logout dialog */}
      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Seguro que deseas cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">Tu sesión será cerrada y serás redirigido al login.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Cerrar sesión</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Modificar usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-foreground text-sm">Nombre</Label>
              <Input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="bg-muted border-border text-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground text-sm">Correo electrónico</Label>
              <Input value={user?.email || ""} readOnly className="bg-muted border-border text-foreground opacity-60" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfile(false)} className="border-border text-foreground hover:bg-muted">Cancelar</Button>
            <Button onClick={handleSaveProfile} className="bg-primary text-primary-foreground hover:bg-primary/90">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
