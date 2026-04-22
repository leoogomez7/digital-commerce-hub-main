import { useState, useEffect } from "react";
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, Activity, Smartphone } from "lucide-react";

export default function DemoDashboard() {
  const [metrics, setMetrics] = useState({
    totalSalesAmount: 0,
    totalStock: 0,
    totalClients: 0,
    todaySalesCount: 0
  });

  useEffect(() => {
    // 1. Cargar datos de Servicios y Productos
    const services = JSON.parse(sessionStorage.getItem("demo_available_services") || "[]");
    const products = JSON.parse(sessionStorage.getItem("demo_available_products") || "[]");
    
    // 2. Cargar datos de Ventas
    const serviceSales = JSON.parse(sessionStorage.getItem("demo_service_sales") || "[]");
    const productSales = JSON.parse(sessionStorage.getItem("demo_product_sales") || "[]");

    // 3. Cálculos
    const totalStock = [...services, ...products].reduce((acc, item) => acc + (Number(item.stock ?? item.quantity) || 0), 0);
    
    const allSales = [...serviceSales, ...productSales];
    const totalSalesAmount = allSales.reduce((acc, sale) => acc + (Number(sale.salePrice) || 0), 0);
    
    // Clientes únicos basados en el nombre
    const uniqueClients = new Set(allSales.map(sale => sale.clientName?.toLowerCase())).size;

    // Ventas de hoy
    const today = new Date().toISOString().split('T')[0];
    const todaySales = allSales.filter(sale => sale.saleDate === today).length;

    setMetrics({
      totalSalesAmount,
      totalStock,
      totalClients: uniqueClients,
      todaySalesCount: todaySales
    });
  }, []);

  const stats = [
    { label: "Total vendido ($)", value: `$${metrics.totalSalesAmount.toLocaleString()}`, icon: TrendingUp, color: "text-green-500", detail: "Recaudación total" },
    { label: "Stock Disponible", value: metrics.totalStock.toString(), icon: Package, color: "text-blue-500", detail: "Unidades en inventario" },
    { label: "Clientes", value: metrics.totalClients.toString(), icon: Users, color: "text-purple-500", detail: "Clientes registrados" },
    { label: "Cantidad de Ventas (Hoy)", value: metrics.todaySalesCount.toString(), icon: ShoppingCart, color: "text-orange-500", detail: "Operaciones hoy" },
  ];

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground text-sm">Rendimiento real basado en tus registros demo.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[10px] font-bold text-primary uppercase">Sincronizado</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-foreground mt-1">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-2 italic">{stat.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-6 border border-border/50 bg-muted/5">
          <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-primary">Resumen de Actividad</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este panel ahora refleja los datos que cargas en las secciones de <strong>Servicios</strong> y <strong>Productos</strong>. 
            Si el panel marca 0, es porque aún no has ingresado stock o registrado ventas en esta sesión.
          </p>
        </div>
        
        <div className="glass-card p-6 border border-border/50 bg-primary/5 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Estado del Sistema</p>
            <div className="flex items-center gap-2 text-emerald-500 font-bold">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Datos vinculados correctamente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
