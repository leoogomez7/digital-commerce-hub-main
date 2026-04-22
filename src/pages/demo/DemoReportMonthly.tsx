import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, CalendarDays, TrendingUp } from "lucide-react";
import { subMonths, format, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";

export default function DemoReportMonthly() {
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
    
    // Generar datos reales para los últimos 6 meses
    return [5, 4, 3, 2, 1, 0].map((monthsAgo) => {
      const date = subMonths(today, monthsAgo);
      const monthLabel = format(date, "MMMM yyyy", { locale: es });
      
      // Filtrar ventas que pertenecen a este mes
      const weekServices = serviceSales.filter(s => isSameMonth(new Date(s.saleDate + 'T12:00:00'), date));
      const weekProducts = productSales.filter(p => isSameMonth(new Date(p.saleDate + 'T12:00:00'), date));

      return {
        month: monthLabel,
        // Datos de Productos
        prodQty: weekProducts.reduce((acc, curr) => acc + (curr.quantity || 0), 0),
        prodProfit: weekProducts.reduce((acc, curr) => acc + (curr.profit || 0), 0),
        prodCost: weekProducts.reduce((acc, curr) => acc + (curr.totalCost || 0), 0),
        // Datos de Servicios
        svcQty: weekServices.reduce((acc, curr) => acc + (curr.quantity || 0), 0),
        svcProfit: weekServices.reduce((acc, curr) => acc + (curr.profit || 0), 0),
        svcCost: weekServices.reduce((acc, curr) => acc + (curr.totalCost || 0), 0),
        topClient: "N/A",
        get totalQty() { return this.prodQty + this.svcQty },
        get totalProfit() { return this.prodProfit + this.svcProfit },
        get totalCost() { return this.prodCost + this.svcCost }
      };
    });
  }, [serviceSales, productSales]);

  const chartData = useMemo(() => {
    return report.map(r => ({ 
      mes: r.month.split(" ")[0].slice(0, 3), 
      ventas: r.totalQty, 
      ganancias: r.totalProfit 
    }));
  }, [report]);

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Procesando métricas reales...</p>
    </div>
  );

  const CardSection = ({ title, data }: { title: string; data: any[] }) => (
    <div className="glass-card p-5 space-y-4 h-full border border-border/50">
      <div className="flex items-center justify-between border-b border-primary/10 pb-2">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">{title}</h3>
        <TrendingUp className="h-3 w-3 text-primary/40" />
      </div>
      <div className="space-y-4 pt-2">
        {data.map((r, i) => (
          <div key={i} className="border border-border/40 rounded-lg p-3 bg-muted/5">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-3 w-3 text-primary" />
              <p className="text-foreground font-semibold text-[13px] capitalize">{r.month}</p>
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              <div className="bg-background/40 p-2 rounded border border-border/20">
                <p className="text-[10px] text-muted-foreground uppercase">Cant.</p>
                <p className="text-sm font-medium">{r.qty}</p>
              </div>
              <div className="bg-background/40 p-2 rounded border border-border/20">
                <p className="text-[10px] text-muted-foreground uppercase">Ganancia</p>
                <p className="text-sm font-bold text-green-500">${r.profit.toLocaleString()}</p>
              </div>
              <div className="bg-background/40 p-2 rounded border border-border/20">
                <p className="text-[10px] text-muted-foreground uppercase">Gasto</p>
                <p className="text-sm font-medium text-destructive/80">${r.cost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <h1 className="text-2xl font-bold text-foreground">Reporte Mensual</h1>

      <div className="glass-card p-6 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wider">Histórico de Ventas vs Ganancias</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: 'hsl(217,33%,17%)'}}
                contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8 }} 
              />
              <Bar dataKey="ventas" name="Unidades" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="ganancias" name="Ganancia ($)" fill="hsl(142,76%,36%)" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <CardSection title="Productos" data={report.map(r => ({ month: r.month, qty: r.prodQty, profit: r.prodProfit, cost: r.prodCost }))} />
        <CardSection title="Servicios" data={report.map(r => ({ month: r.month, qty: r.svcQty, profit: r.svcProfit, cost: r.svcCost }))} />
        <CardSection title="Consolidado" data={report.map(r => ({ month: r.month, qty: r.totalQty, profit: r.totalProfit, cost: r.totalCost }))} />
      </div>
    </div>
  );
}
