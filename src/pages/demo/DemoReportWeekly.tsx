import { useState, useMemo, useEffect } from "react";
import { startOfWeek, format, subWeeks, isSameWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, BarChart2 } from "lucide-react";

function getWeekKey(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return `Semana del ${format(weekStart, "d MMM yyyy", { locale: es })}`;
}

export default function DemoReportWeekly() {
  const [loading, setLoading] = useState(true);
  const [serviceSales, setServiceSales] = useState<any[]>([]);
  const [productSales, setProductSales] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // LEER DATOS REALES DE LA SESIÓN
      const sSales = JSON.parse(sessionStorage.getItem("demo_service_sales") || "[]");
      const pSales = JSON.parse(sessionStorage.getItem("demo_product_sales") || "[]");
      setServiceSales(sSales);
      setProductSales(pSales);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const report = useMemo(() => {
    const today = new Date();
    
    // Generar las últimas 4 semanas vacías por defecto
    return [0, 1, 2, 3].map((weeksAgo) => {
      const date = subWeeks(today, weeksAgo);
      const weekLabel = getWeekKey(date);
      
      // Filtrar ventas que pertenecen a esta semana
      const weekServices = serviceSales.filter(s => isSameWeek(new Date(s.saleDate + 'T12:00:00'), date, { weekStartsOn: 1 }));
      const weekProducts = productSales.filter(p => isSameWeek(new Date(p.saleDate + 'T12:00:00'), date, { weekStartsOn: 1 }));

      return {
        week: weekLabel,
        // Datos de Productos
        prodQty: weekProducts.reduce((acc, curr) => acc + (curr.quantity || 0), 0),
        prodProfit: weekProducts.reduce((acc, curr) => acc + (curr.profit || 0), 0),
        prodCost: weekProducts.reduce((acc, curr) => acc + (curr.totalCost || 0), 0),
        // Datos de Servicios
        svcQty: weekServices.reduce((acc, curr) => acc + (curr.quantity || 0), 0),
        svcProfit: weekServices.reduce((acc, curr) => acc + (curr.profit || 0), 0),
        svcCost: weekServices.reduce((acc, curr) => acc + (curr.totalCost || 0), 0),
        // Cliente con más compras en la semana
        topClient: "N/A",
        get totalQty() { return this.prodQty + this.svcQty },
        get totalProfit() { return this.prodProfit + this.svcProfit },
        get totalCost() { return this.prodCost + this.svcCost }
      };
    });
  }, [serviceSales, productSales]);

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground text-sm">Sincronizando reportes...</p>
    </div>
  );

  const Section = ({ title, getData }: { title: string; getData: (r: any) => { qty: number; profit: number; cost: number } }) => (
    <div className="glass-card p-5 space-y-3 h-full border border-border/50">
      <div className="flex items-center justify-between border-b border-primary/10 pb-2">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">{title}</h3>
        <BarChart2 className="h-3 w-3 text-primary/40" />
      </div>
      <div className="space-y-4 pt-2">
        {report.map((r, i) => {
          const d = getData(r);
          return (
            <div key={i} className="border border-border/40 rounded-lg p-3 bg-muted/5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-3 w-3 text-primary" />
                <p className="text-foreground font-semibold text-[13px]">{r.week}</p>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                <div className="bg-background/40 p-2 rounded border border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase">Cant.</p>
                  <p className="text-sm font-medium">{d.qty}</p>
                </div>
                <div className="bg-background/40 p-2 rounded border border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase">Ganancia</p>
                  <p className="text-sm font-bold text-green-500">${d.profit.toLocaleString()}</p>
                </div>
                <div className="bg-background/40 p-2 rounded border border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase">Gasto</p>
                  <p className="text-sm font-medium text-destructive/80">${d.cost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Reporte Semanal</h1>
          <p className="text-muted-foreground text-sm">Resumen basado en operaciones registradas</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Section title="Productos" getData={r => ({ qty: r.prodQty, profit: r.prodProfit, cost: r.prodCost })} />
        <Section title="Servicios" getData={r => ({ qty: r.svcQty, profit: r.svcProfit, cost: r.svcCost })} />
        <Section title="Total" getData={r => ({ qty: r.totalQty, profit: r.totalProfit, cost: r.totalCost })} />
      </div>
    </div>
  );
}
