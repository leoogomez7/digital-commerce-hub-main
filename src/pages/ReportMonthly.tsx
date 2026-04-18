import { useState, useMemo, useEffect } from "react";
import { client } from "@/lib/db";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, CalendarDays } from "lucide-react";

function getMonthKey(date: string) {
  if (!date) return "Sin fecha";
  const d = new Date(date);
  return d.toLocaleDateString("es", { year: "numeric", month: "long" });
}

export default function ReportMonthly() {
  const { user, isAuthenticated } = useKindeAuth();
  const [productSales, setProductSales] = useState<any[]>([]);
  const [serviceSales, setServiceSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS DESDE TURSO
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const [prodRes, servRes] = await Promise.all([
          client.execute({
            sql: "SELECT * FROM product_sales WHERE user_id = ?",
            args: [user.id]
          }),
          client.execute({
            sql: "SELECT * FROM service_sales WHERE user_id = ?",
            args: [user.id]
          })
        ]);
        setProductSales(prodRes.rows);
        setServiceSales(servRes.rows);
      } catch (err) {
        console.error("Error en reporte mensual:", err);
      } finally {
        setLoading(false);
      }
    }
    if (isAuthenticated) loadData();
  }, [user, isAuthenticated]);

  // 2. PROCESAR REPORTE (Memoizado)
  const report = useMemo(() => {
    const months: Record<string, any> = {};
    const ensure = (m: string) => { 
      if (!months[m]) months[m] = { prodQty: 0, prodProfit: 0, prodCost: 0, svcQty: 0, svcProfit: 0, svcCost: 0, clients: [] }; 
    };

    productSales.forEach(p => {
      const m = getMonthKey(p.saleDate);
      ensure(m);
      months[m].prodQty += Number(p.quantity);
      months[m].prodProfit += Number(p.profit);
      months[m].prodCost += Number(p.totalCost) + Number(p.externalCosts);
      months[m].clients.push(p.clientName);
    });

    serviceSales.forEach(s => {
      const m = getMonthKey(s.saleDate);
      ensure(m);
      months[m].svcQty += Number(s.quantity);
      months[m].svcProfit += Number(s.profit);
      months[m].svcCost += Number(s.totalCost) + Number(s.externalCosts);
      months[m].clients.push(s.clientName);
    });

    return Object.entries(months)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Ordenar por fecha
      .map(([month, d]) => {
        const clientCount: Record<string, number> = {};
        d.clients.forEach((c: string) => { clientCount[c] = (clientCount[c] || 0) + 1; });
        const topClient = Object.entries(clientCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
        return { 
          month, ...d, 
          totalQty: d.prodQty + d.svcQty, 
          totalProfit: d.prodProfit + d.svcProfit, 
          totalCost: d.prodCost + d.svcCost, 
          topClient 
        };
      });
  }, [productSales, serviceSales]);

  const chartData = report.map(r => ({ 
    mes: r.month.split(" ")[0].slice(0, 3), 
    ventas: r.totalQty, 
    ganancias: r.totalProfit 
  })).reverse(); // Invertir para que el gráfico fluya de pasado a presente

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Sincronizando reporte mensual...</p>
    </div>
  );

  const CardSection = ({ title, data }: { title: string; data: any[] }) => (
    <div className="glass-card p-5 space-y-4 h-full">
      <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-2">{title}</h3>
      {data.length === 0 ? (
        <p className="text-muted-foreground text-xs text-center py-10 italic">Sin actividad este mes</p>
      ) : (
        <div className="space-y-4">
          {data.map((r, i) => (
            <div key={i} className="border border-border/40 rounded-lg p-4 bg-muted/5 hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <p className="text-foreground font-semibold text-sm capitalize">{r.month}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-background/40 p-2 rounded">
                  <p className="text-[10px] text-muted-foreground uppercase">Cant. Vendida</p>
                  <p className="font-medium">{r.qty}</p>
                </div>
                <div className="bg-background/40 p-2 rounded">
                  <p className="text-[10px] text-muted-foreground uppercase">Ganancia Neta</p>
                  <p className="font-bold text-green-500">${r.profit.toLocaleString()}</p>
                </div>
                <div className="bg-background/40 p-2 rounded">
                  <p className="text-[10px] text-muted-foreground uppercase">Costo Total</p>
                  <p className="font-medium text-destructive/80">${r.cost.toLocaleString()}</p>
                </div>
                <div className="bg-background/40 p-2 rounded">
                  <p className="text-[10px] text-muted-foreground uppercase">Mejor Cliente</p>
                  <p className="font-medium text-xs truncate">{r.topClient}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Reporte Mensual</h1>
        <p className="text-muted-foreground text-sm">Análisis de crecimiento y rentabilidad por mes</p>
      </div>

      {chartData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wider">Histórico de Ventas vs Ganancias</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'hsl(217,33%,17%)'}}
                  contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,98%)' }} 
                />
                <Bar dataKey="ventas" name="Unidades" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="ganancias" name="Ganancia ($)" fill="hsl(142,76%,36%)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <CardSection 
          title="Productos" 
          data={report.map(r => ({ month: r.month, qty: r.prodQty, profit: r.prodProfit, cost: r.prodCost, topClient: r.topClient }))} 
        />
        <CardSection 
          title="Servicios Digitales" 
          data={report.map(r => ({ month: r.month, qty: r.svcQty, profit: r.svcProfit, cost: r.svcCost, topClient: r.topClient }))} 
        />
        <CardSection 
          title="Total General" 
          data={report.map(r => ({ month: r.month, qty: r.totalQty, profit: r.totalProfit, cost: r.totalCost, topClient: r.topClient }))} 
        />
      </div>
    </div>
  );
}
