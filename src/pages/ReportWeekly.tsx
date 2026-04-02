import { useMemo } from "react";
import { getProductSales, getServiceSales } from "@/lib/store";
import { startOfWeek, format } from "date-fns";
import { es } from "date-fns/locale";

function getWeekKey(date: string) {
  if (!date) return "Sin fecha";
  const d = new Date(date);
  const weekStart = startOfWeek(d, { weekStartsOn: 1 });
  return `Semana del ${format(weekStart, "d MMM yyyy", { locale: es })}`;
}

export default function ReportWeekly() {
  const productSales = getProductSales();
  const serviceSales = getServiceSales();

  const report = useMemo(() => {
    const weeks: Record<string, { prodQty: number; prodProfit: number; prodCost: number; svcQty: number; svcProfit: number; svcCost: number; clients: string[] }> = {};
    const ensure = (w: string) => { if (!weeks[w]) weeks[w] = { prodQty: 0, prodProfit: 0, prodCost: 0, svcQty: 0, svcProfit: 0, svcCost: 0, clients: [] }; };

    productSales.forEach(p => {
      const w = getWeekKey(p.saleDate);
      ensure(w);
      weeks[w].prodQty += p.quantity;
      weeks[w].prodProfit += p.profit;
      weeks[w].prodCost += p.totalCost + p.externalCosts;
      weeks[w].clients.push(p.clientName);
    });

    serviceSales.forEach(s => {
      const w = getWeekKey(s.saleDate);
      ensure(w);
      weeks[w].svcQty += s.quantity;
      weeks[w].svcProfit += s.profit;
      weeks[w].svcCost += s.totalCost + s.externalCosts;
      weeks[w].clients.push(s.clientName);
    });

    return Object.entries(weeks).map(([week, d]) => {
      const clientCount: Record<string, number> = {};
      d.clients.forEach(c => { clientCount[c] = (clientCount[c] || 0) + 1; });
      const topClient = Object.entries(clientCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
      return { week, ...d, totalQty: d.prodQty + d.svcQty, totalProfit: d.prodProfit + d.svcProfit, totalCost: d.prodCost + d.svcCost, topClient };
    });
  }, [productSales, serviceSales]);

  const Section = ({ title, getData }: { title: string; getData: (r: typeof report[0]) => { qty: number; profit: number; cost: number } }) => (
    <div className="glass-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">{title}</h3>
      {report.length === 0 ? <p className="text-muted-foreground text-sm text-center py-4">Sin datos</p> :
        report.map((r, i) => {
          const d = getData(r);
          return (
            <div key={i} className="border border-border rounded-lg p-4">
              <p className="text-foreground font-medium text-sm mb-2">{r.week}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Cantidad</p><p className="text-foreground font-medium">{d.qty}</p></div>
                <div><p className="text-muted-foreground text-xs">Ganancias</p><p className="text-success font-medium">${d.profit.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground text-xs">Gastos</p><p className="text-destructive font-medium">${d.cost.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground text-xs">Cliente top</p><p className="text-foreground font-medium">{r.topClient}</p></div>
              </div>
            </div>
          );
        })}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Reporte Semanal</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <Section title="Productos" getData={r => ({ qty: r.prodQty, profit: r.prodProfit, cost: r.prodCost })} />
        <Section title="Servicios Digitales" getData={r => ({ qty: r.svcQty, profit: r.svcProfit, cost: r.svcCost })} />
        <Section title="Total General" getData={r => ({ qty: r.totalQty, profit: r.totalProfit, cost: r.totalCost })} />
      </div>
    </div>
  );
}
