import { useMemo } from "react";
import { getProductSales, getServiceSales } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ReportAnnual() {
  const productSales = getProductSales();
  const serviceSales = getServiceSales();

  const report = useMemo(() => {
    const years: Record<string, { months: Record<string, { qty: number; profit: number; cost: number }>; prodQty: number; prodProfit: number; prodCost: number; svcQty: number; svcProfit: number; svcCost: number; clients: string[] }> = {};
    const ensure = (y: string) => { if (!years[y]) years[y] = { months: {}, prodQty: 0, prodProfit: 0, prodCost: 0, svcQty: 0, svcProfit: 0, svcCost: 0, clients: [] }; };
    const ensureMonth = (y: string, m: string) => { if (!years[y].months[m]) years[y].months[m] = { qty: 0, profit: 0, cost: 0 }; };

    productSales.forEach(p => {
      const y = p.saleDate?.slice(0, 4) || "Sin año";
      const m = p.saleDate?.slice(5, 7) || "00";
      ensure(y); ensureMonth(y, m);
      years[y].prodQty += p.quantity;
      years[y].prodProfit += p.profit;
      years[y].prodCost += p.totalCost + p.externalCosts;
      years[y].months[m].qty += p.quantity;
      years[y].months[m].profit += p.profit;
      years[y].months[m].cost += p.totalCost + p.externalCosts;
      years[y].clients.push(p.clientName);
    });

    serviceSales.forEach(s => {
      const y = s.saleDate?.slice(0, 4) || "Sin año";
      const m = s.saleDate?.slice(5, 7) || "00";
      ensure(y); ensureMonth(y, m);
      years[y].svcQty += s.quantity;
      years[y].svcProfit += s.profit;
      years[y].svcCost += s.totalCost + s.externalCosts;
      years[y].months[m].qty += s.quantity;
      years[y].months[m].profit += s.profit;
      years[y].months[m].cost += s.totalCost + s.externalCosts;
      years[y].clients.push(s.clientName);
    });

    return Object.entries(years).map(([year, d]) => {
      const clientCount: Record<string, number> = {};
      d.clients.forEach(c => { clientCount[c] = (clientCount[c] || 0) + 1; });
      const topClient = Object.entries(clientCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

      const monthEntries = Object.entries(d.months).sort();
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const mn = (m: string) => monthNames[parseInt(m) - 1] || m;

      const byQty = [...monthEntries].sort((a, b) => b[1].qty - a[1].qty);
      const byProfit = [...monthEntries].sort((a, b) => b[1].profit - a[1].profit);

      return {
        year, topClient,
        totalQty: d.prodQty + d.svcQty, totalProfit: d.prodProfit + d.svcProfit, totalCost: d.prodCost + d.svcCost,
        prodQty: d.prodQty, prodProfit: d.prodProfit, prodCost: d.prodCost,
        svcQty: d.svcQty, svcProfit: d.svcProfit, svcCost: d.svcCost,
        bestSalesMonth: byQty[0] ? `${mn(byQty[0][0])} (${byQty[0][1].qty})` : "—",
        worstSalesMonth: byQty.length ? `${mn(byQty[byQty.length - 1][0])} (${byQty[byQty.length - 1][1].qty})` : "—",
        bestProfitMonth: byProfit[0] ? `${mn(byProfit[0][0])} ($${byProfit[0][1].profit})` : "—",
        worstProfitMonth: byProfit.length ? `${mn(byProfit[byProfit.length - 1][0])} ($${byProfit[byProfit.length - 1][1].profit})` : "—",
        chartData: monthEntries.map(([m, v]) => ({ mes: mn(m), ventas: v.qty, ganancias: v.profit })),
      };
    });
  }, [productSales, serviceSales]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Reporte Anual</h1>

      {report.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Sin datos para mostrar</div>
      ) : report.map(r => (
        <div key={r.year} className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{r.year}</h2>

          {r.chartData.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium text-foreground mb-4">Resumen anual</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={r.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                    <XAxis dataKey="mes" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,98%)' }} />
                    <Bar dataKey="ventas" name="Ventas" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ganancias" name="Ganancias" fill="hsl(142,76%,36%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-4">
            {[
              { title: "Productos", qty: r.prodQty, profit: r.prodProfit, cost: r.prodCost },
              { title: "Servicios Digitales", qty: r.svcQty, profit: r.svcProfit, cost: r.svcCost },
              { title: "Total General", qty: r.totalQty, profit: r.totalProfit, cost: r.totalCost },
            ].map((s, i) => (
              <div key={i} className="glass-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">{s.title}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground text-xs">Cantidad</p><p className="text-foreground font-bold">{s.qty}</p></div>
                  <div><p className="text-muted-foreground text-xs">Ganancias</p><p className="text-success font-bold">${s.profit.toLocaleString()}</p></div>
                  <div><p className="text-muted-foreground text-xs">Gastos</p><p className="text-destructive font-bold">${s.cost.toLocaleString()}</p></div>
                  <div><p className="text-muted-foreground text-xs">Cliente top</p><p className="text-foreground font-medium">{r.topClient}</p></div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Mayor ventas</p><p className="text-foreground font-medium">{r.bestSalesMonth}</p></div>
              <div><p className="text-muted-foreground text-xs">Menor ventas</p><p className="text-foreground font-medium">{r.worstSalesMonth}</p></div>
              <div><p className="text-muted-foreground text-xs">Mayor ganancias</p><p className="text-foreground font-medium">{r.bestProfitMonth}</p></div>
              <div><p className="text-muted-foreground text-xs">Menor ganancias</p><p className="text-foreground font-medium">{r.worstProfitMonth}</p></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
