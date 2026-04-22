import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, Calendar, Trophy, AlertTriangle } from "lucide-react";
import { getYear, getMonth, parseISO } from "date-fns";

export default function DemoReportAnnual() {
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
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const report = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear.toString(), (currentYear - 1).toString()];
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const allSales = [...serviceSales, ...productSales];

    return years.map((year) => {
      const yearInt = parseInt(year);
      
      // Procesar cada mes del año actual/anterior
      const monthEntries = monthNames.map((mes, mIdx) => {
        const monthSales = allSales.filter(sale => {
          const d = parseISO(sale.saleDate);
          return getYear(d) === yearInt && getMonth(d) === mIdx;
        });

        return {
          mes,
          qty: monthSales.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0),
          profit: monthSales.reduce((acc, s) => acc + (Number(s.profit) || 0), 0),
          cost: monthSales.reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0)
        };
      });

      // Cálculos Consolidados
      const totalQty = monthEntries.reduce((acc, m) => acc + m.qty, 0);
      const totalProfit = monthEntries.reduce((acc, m) => acc + m.profit, 0);
      const totalCost = monthEntries.reduce((acc, m) => acc + m.cost, 0);

      // Separación Real por Categoría
      const yearServices = serviceSales.filter(s => getYear(parseISO(s.saleDate)) === yearInt);
      const yearProducts = productSales.filter(p => getYear(parseISO(p.saleDate)) === yearInt);

      // Encontrar mejores meses (solo si hay ventas)
      const sortedByQty = [...monthEntries].sort((a, b) => b.qty - a.qty);
      const hasSales = totalQty > 0;

      return {
        year,
        totalQty,
        totalProfit,
        totalCost,
        prodQty: yearProducts.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0),
        prodProfit: yearProducts.reduce((acc, p) => acc + (Number(p.profit) || 0), 0),
        prodCost: yearProducts.reduce((acc, p) => acc + (Number(p.totalCost) || 0), 0),
        svcQty: yearServices.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0),
        svcProfit: yearServices.reduce((acc, s) => acc + (Number(s.profit) || 0), 0),
        svcCost: yearServices.reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0),
        bestSalesMonth: hasSales ? `${sortedByQty[0].mes} (${sortedByQty[0].qty})` : "N/A",
        worstSalesMonth: hasSales ? `${sortedByQty[11].mes} (${sortedByQty[11].qty})` : "N/A",
        chartData: monthEntries
      };
    });
  }, [serviceSales, productSales]);

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Consolidando historial anual real...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2 pb-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="h-5 w-5 text-primary" /></div>
          <h1 className="text-2xl font-bold text-foreground">Reporte Anual</h1>
        </div>
      </div>

      {report.map(r => (
        <div key={r.year} className="space-y-6 border-b border-border/50 pb-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-primary">{r.year}</h2>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <div className="glass-card p-6 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wider">Crecimiento Mensual {r.year}</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={r.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'hsl(217,33%,17%)'}}
                    contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8 }} 
                  />
                  <Bar dataKey="qty" name="Ventas" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="profit" name="Ganancia ($)" fill="hsl(142,76%,36%)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-border flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Mejor Mes (Ventas)</p>
                <p className="text-sm font-bold">{r.bestSalesMonth}</p>
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border border-border flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Mes más flojo</p>
                <p className="text-sm font-bold">{r.worstSalesMonth}</p>
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border border-border flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Total Unidades Año</p>
                <p className="text-sm font-bold">{r.totalQty} unidades</p>
              </div>
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
                  <div className="bg-background/40 p-3 rounded-md border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase text-center">Cant.</p>
                    <p className="text-lg font-bold text-center">{s.qty}</p>
                  </div>
                  <div className="bg-background/40 p-3 rounded-md border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase text-center">Ganancia</p>
                    <p className="text-lg font-bold text-green-500 text-center">${s.profit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
