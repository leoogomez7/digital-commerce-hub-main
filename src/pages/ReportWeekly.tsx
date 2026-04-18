import { useState, useMemo, useEffect } from "react";
import { client } from "@/lib/db";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { startOfWeek, format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Calendar } from "lucide-react";

function getWeekKey(date: string) {
  if (!date) return "Sin fecha";
  const d = new Date(date);
  // Ajustamos para que la semana empiece el lunes
  const weekStart = startOfWeek(d, { weekStartsOn: 1 });
  return `Semana del ${format(weekStart, "d MMM yyyy", { locale: es })}`;
}

export default function ReportWeekly() {
  const { user, isAuthenticated } = useKindeAuth();
  const [productSales, setProductSales] = useState<any[]>([]);
  const [serviceSales, setServiceSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos desde la nube
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
        console.error("Error en reporte semanal:", err);
      } finally {
        setLoading(false);
      }
    }
    if (isAuthenticated) loadData();
  }, [user, isAuthenticated]);

  // 2. Procesar reporte semanal (Memoizado)
  const report = useMemo(() => {
    const weeks: Record<string, any> = {};
    
    const ensure = (w: string) => { 
      if (!weeks[w]) weeks[w] = { prodQty: 0, prodProfit: 0, prodCost: 0, svcQty: 0, svcProfit: 0, svcCost: 0, clients: [] }; 
    };

    productSales.forEach(p => {
      const w = getWeekKey(p.saleDate);
      ensure(w);
      weeks[w].prodQty += Number(p.quantity);
      weeks[w].prodProfit += Number(p.profit);
      weeks[w].prodCost += Number(p.totalCost) + Number(p.externalCosts);
      weeks[w].clients.push(p.clientName);
    });

    serviceSales.forEach(s => {
      const w = getWeekKey(s.saleDate);
      ensure(w);
      weeks[w].svcQty += Number(s.quantity);
      weeks[w].svcProfit += Number(s.profit);
      weeks[w].svcCost += Number(s.totalCost) + Number(s.externalCosts);
      weeks[w].clients.push(s.clientName);
    });

    // Ordenar semanas por fecha (de más reciente a más antigua)
    return Object.entries(weeks)
      .sort((a, b) => new Date(b[0].split("del ")[1]).getTime() - new Date(a[0].split("del ")[1]).getTime())
      .map(([week, d]) => {
        const clientCount: Record<string, number> = {};
        d.clients.forEach((c: string) => { clientCount[c] = (clientCount[c] || 0) + 1; });
        const topClient = Object.entries(clientCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
        return { 
          week, ...d, 
          totalQty: d.prodQty + d.svcQty, 
          totalProfit: d.prodProfit + d.svcProfit, 
          totalCost: d.prodCost + d.svcCost, 
          topClient 
        };
      });
  }, [productSales, serviceSales]);

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Generando reporte semanal...</p>
    </div>
  );

  const Section = ({ title, getData }: { title: string; getData: (r: any) => { qty: number; profit: number; cost: number } }) => (
    <div className="glass-card p-5 space-y-3 h-full">
      <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-2">{title}</h3>
      {report.length === 0 ? (
        <p className="text-muted-foreground text-xs text-center py-10 italic">No hay ventas registradas</p>
      ) : (
        <div className="space-y-4 pt-2">
          {report.map((r, i) => {
            const d = getData(r);
            return (
              <div key={i} className="border border-border/40 rounded-lg p-3 bg-muted/5 hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <p className="text-foreground font-semibold text-[13px]">{r.week}</p>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                  <div className="bg-background/40 p-2 rounded">
                    <p className="text-[10px] text-muted-foreground uppercase">Cant.</p>
                    <p className="text-sm font-medium">{d.qty}</p>
                  </div>
                  <div className="bg-background/40 p-2 rounded">
                    <p className="text-[10px] text-muted-foreground uppercase">Ganancia</p>
                    <p className="text-sm font-bold text-green-500">${d.profit.toLocaleString()}</p>
                  </div>
                  <div className="bg-background/40 p-2 rounded">
                    <p className="text-[10px] text-muted-foreground uppercase">Gasto</p>
                    <p className="text-sm font-medium text-destructive/80">${d.cost.toLocaleString()}</p>
                  </div>
                  <div className="bg-background/40 p-2 rounded">
                    <p className="text-[10px] text-muted-foreground uppercase">Top Cliente</p>
                    <p className="text-[11px] font-medium truncate">{r.topClient}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Reporte Semanal</h1>
        <p className="text-muted-foreground text-sm">Resumen de rendimiento agrupado por semanas</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Section title="Productos" getData={r => ({ qty: r.prodQty, profit: r.prodProfit, cost: r.prodCost })} />
        <Section title="Servicios" getData={r => ({ qty: r.svcQty, profit: r.svcProfit, cost: r.svcCost })} />
        <Section title="Consolidado" getData={r => ({ qty: r.totalQty, profit: r.totalProfit, cost: r.totalCost })} />
      </div>
    </div>
  );
}
