import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, Package, Monitor, ShoppingCart, MonitorSmartphone,
  CalendarDays, CalendarRange, Calendar, LogOut, Menu, X, Zap, User, ClipboardList, Plus
} from "lucide-react";

// Navegación completa apuntando a las versiones DEMO
const navItems = [
  { label: "Panel principal", icon: LayoutDashboard, path: "/demo/dashboard" },
  { label: "Nuevo producto", icon: Package, path: "/demo/new-product" },
  { label: "Nuevo servicio digital", icon: Monitor, path: "/demo/new-service" },
  { label: "Productos disponibles", icon: ClipboardList, path: "/demo/available-products" },
  { label: "Servicios disponibles", icon: ClipboardList, path: "/demo/available-services" },
  { label: "Nueva venta producto", icon: Plus, path: "/demo/new-product-sale" },
  { label: "Nueva venta servicio", icon: Plus, path: "/demo/new-service-sale" },
  { label: "Productos vendidos", icon: ShoppingCart, path: "/demo/product-sales" },
  { label: "Servicios vendidos", icon: MonitorSmartphone, path: "/demo/service-sales" },
  { label: "Reporte mensual", icon: CalendarDays, path: "/demo/report-monthly" },
  { label: "Reporte semanal", icon: CalendarRange, path: "/demo/report-weekly" },
  { label: "Reporte anual", icon: Calendar, path: "/demo/report-annual" },
];

export default function DemoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const demoUser = JSON.parse(sessionStorage.getItem("demo_user") || '{"email":"invitado@demo.com"}');

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Demo */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-14'} bg-card border-r border-border transition-all duration-300 flex flex-col h-screen sticky top-0`}>
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
          <Zap className="h-5 w-5 text-primary shrink-0" />
          {sidebarOpen && <span className="font-bold text-sm whitespace-nowrap">Control Ventas (DEMO)</span>}
        </div>

        <nav className="flex-1 py-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
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

        <div className="p-3 border-t border-border shrink-0">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Salir de Demo</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-xl sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:inline font-medium">{demoUser.email}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 animate-fade-in overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
