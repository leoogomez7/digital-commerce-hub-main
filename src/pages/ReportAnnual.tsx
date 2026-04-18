import { useState, useMemo, useEffect } from "react";
// --- NUBE ---
import { client } from "@/lib/db";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
// ------------
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, Calendar } from "lucide-react";

// Definimos la estructura de los datos mensuales para que TypeScript no de error
interface MonthStats {
  qty: number;
  profit: number;
  cost: number;
}

export default function ReportAnnual() {
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
        console.error("Error en reporte anual:", err);
      } finally {
        setLoading(false);
      }
    }
    if (isAuthenticated) loadData();
  }, [user, isAuthenticated]);

  // 2. PROCESAR REPORTE (Memoizado)
  const report = useMemo(() => {
    const years: Record<string, any> = {};
    
    const ensure = (y: string) => { 
      if (!years[y]) years[y] = { months: {}, prodQty: 0, prodProfit: 0, prodCost: 0, svcQty: 0, svcProfit: 0, svcCost: 0, clients: [] }; 
    };
    
    const ensureMonth = (y: string, m: string) => { 
      if (!years[y].months[m]) years[y].months[m] = { qty: 0, profit: 0, cost: 0 }; 
    };

    const processItem = (item: any, type: 'prod' | 'svc') => {
      const y = item.saleDate?.slice(0, 4) || "Sin año";
      const m = item.saleDate?.slice(5, 7) || "01";
      ensure(y); ensureMonth(y, m);
      
      const qty = Number(item.quantity) || 0;
      const profit = Number(item.profit) || 0;
      const cost = (Number(item.totalCost) || 0) + (Number(item.externalCosts) || 0);

      years[y][`${type}Qty`] += qty;
      years[y][`${type}Profit`] += profit;
      years[y][`${type}Cost`] += cost;
      years[y].months[m].qty += qty;
      years[y].months[m].profit += profit;
      years[y].months[m].cost += cost;
      years[y].clients.push(item.clientName);
    };

    productSales.forEach(p => processItem(p, 'prod'));
    serviceSales.forEach(s => processItem(s, 'svc'));

    return Object.entries(years).sort((a, b) => b[0].localeCompare(a[0])).map(([year, d]) => {
      const clientCount: Record<string, number> = {};
      d.clients.forEach((c: string) => { clientCount[c] = (clientCount[c] || 0) + 1; });
      const topClient = Object.entries(clientCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

      // CORRECCIÓN TS: Forzamos el tipo de las entradas mensuales
      const monthEntries = Object.entries(d.months) as [string, MonthStats][];
      monthEntries.sort((a, b) => a[0].localeCompare(b[0]));

      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const mn = (m: string) => monthNames[parseInt(m) - 1] || m;

      // Ordenamos para encontrar mejores/peores meses
      const byQty = [...monthEntries].sort((a, b) => b[1].qty - a[1].qty);
      const byProfit = [...monthEntries].sort((a, b) => b[1].profit - a[1].profit);

      return {
        year, topClient,
        totalQty: d.prodQty + d.svcQty, totalProfit: d.prodProfit + d.svcProfit, totalCost: d.prodCost + d.svcCost,
        prodQty: d.prodQty, prodProfit: d.prodProfit, prodCost: d.prodCost,
        svcQty: d.svcQty, svcProfit: d.svcProfit, svcCost: d.svcCost,
        bestSalesMonth: byQty[0] ? `${mn(byQty[0][0])} (${byQty[0][1].qty})` : "—",
        worstSalesMonth: byQty.length ? `${mn(byQty[byQty.length - 1][0])} (${byQty[byQty.length - 1][1].qty})` : "—",
        bestProfitMonth: byProfit[0] ? `${mn(byProfit[0][0])} ($${byProfit[0][1].profit.toLocaleString()})` : "—",
        worstProfitMonth: byProfit.length ? `${mn(byProfit[byProfit.length - 1][0])} ($${byProfit[byProfit.length - 1][1].profit.toLocaleString()})` : "—",
        chartData: monthEntries.map(([m, v]) => ({ mes: mn(m), ventas: v.qty, ganancias: v.profit })),
      };
    });
  }, [productSales, serviceSales]);

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Consolidando datos anuales...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2 pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="h-5 w-5 text-primary" /></div>
        <h1 className="text-2xl font-bold text-foreground">Reporte Anual</h1>
      </div>

      {report.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground border-dashed border-2">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
          No hay datos históricos para generar el reporte.
        </div>
      ) : report.map(r => (
        <div key={r.year} className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-primary">{r.year}</h2>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wider">Flujo Mensual de {r.year}</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={r.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'hsl(217,33%,17%)'}}
                    contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,98%)' }} 
                  />
                  <Bar dataKey="ventas" name="Ventas" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar dataKey="ganancias" name="Ganancias ($)" fill="hsl(142,76%,36%)" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { title: "Productos", qty: r.prodQty, profit: r.prodProfit, cost: r.prodCost },
              { title: "Servicios Digitales", qty: r.svcQty, profit: r.svcProfit, cost: r.svcCost },
              { title: "Consolidado Final", qty: r.totalQty, profit: r.totalProfit, cost: r.totalCost },
            ].map((s, i) => (
              <div key={i} className="glass-card p-5 space-y-4 border-t-2 border-primary/20">
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest">{s.title}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/40 p-3 rounded-md">
                    <p className="text-[10px] text-muted-foreground uppercase text-center">Unidades</p>
                    <p className="text-lg font-bold text-center">{s.qty}</p>
                  </div>
                  <div className="bg-background/40 p-3 rounded-md">
                    <p className="text-[10px] text-muted-foreground uppercase text-center">Ganancia</p>
                    <p className="text-lg font-bold text-green-500 text-center">${s.profit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-5 bg-primary/5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">Pico de Ventas</p>
                <p className="text-sm font-semibold text-foreground">{r.bestSalesMonth}</p>
              </div>
              <div className="text-center sm:text-left border-l border-border/50 pl-0 sm:pl-6">
                <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">Mayor Rentabilidad</p>
                <p className="text-sm font-semibold text-green-500">{r.bestProfitMonth}</p>
              </div>
              <div className="text-center sm:text-left border-l border-border/50 pl-0 sm:pl-6">
                <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">Cliente Top</p>
                <p className="text-sm font-semibold text-foreground truncate">{r.topClient}</p>
              </div>
              <div className="text-center sm:text-left border-l border-border/50 pl-0 sm:pl-6">
                <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">Gasto Total Anual</p>
                <p className="text-sm font-semibold text-destructive/80">${r.totalCost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
