import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { toast } from "sonner";
import {
  LayoutDashboard, Package, Monitor, ShoppingCart, MonitorSmartphone,
  CalendarDays, CalendarRange, Calendar, LogOut, Menu, X, Zap, ChevronDown,
  User, Plus, ClipboardList, Settings, Loader2
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
  Dialog, DialogContent, DialogHeader, DialogTitle,
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
  
  const { user, logout, isAuthenticated, isLoading } = useKindeAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // LÓGICA DE DEMO: Usamos sessionStorage para que al recargar se borre todo
  const isDemo = sessionStorage.getItem("is_demo") === "true";

  const [profileForm, setProfileForm] = useState({ name: "" });

  useEffect(() => {
    if (user) setProfileForm({ name: user.givenName || "" });
  }, [user]);
  
  useEffect(() => {
    // Si no es demo y no está autenticado, redirigir a landing
    if (!isLoading && !isAuthenticated && !isDemo) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, isDemo, navigate]);

  const handleLogout = () => {
    sessionStorage.clear(); // Limpia la sesión demo
    if (!isDemo) {
      logout();
    } else {
      navigate("/", { replace: true });
    }
  };

  if (isLoading && !isDemo) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated && !isDemo) return null;

  const userName = isDemo ? "Invitado Demo" : (user?.givenName || "Usuario");

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
                onClick={() => { 
                  navigate(item.path); 
                  if (window.innerWidth < 768) setSidebarOpen(false); 
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-[11px] uppercase tracking-wider transition-colors ${
                  active ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
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
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-x-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-xl sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground p-2">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground outline-none px-2">
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline">{userName}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuItem onClick={() => setShowProfile(true)} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" /> Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogout(true)} className="text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6 animate-fade-in overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              {isDemo ? "Se borrarán los datos temporales de la demo." : "Se finalizará tu sesión actual."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">Salir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader><DialogTitle>Información de usuario</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={isDemo ? "Invitado Demo" : profileForm.name} readOnly className="bg-muted" />
            </div>
            <p className="text-xs text-muted-foreground italic">
              {isDemo ? "Modo demo: Los datos no son editables." : "Edita tu nombre desde tu cuenta de Kinde."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
