import { useMemo } from "react";
import { getProductSales, getServiceSales } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function getMonthKey(date: string) {
  if (!date) return "Sin fecha";
  const d = new Date(date);
  return d.toLocaleDateString("es", { year: "numeric", month: "long" });
}

export default function ReportMonthly() {
  const productSales = getProductSales();
  const serviceSales = getServiceSales();

  const report = useMemo(() => {
    const months: Record<string, { prodQty: number; prodProfit: number; prodCost: number; svcQty: number; svcProfit: number; svcCost: number; clients: string[] }> = {};
    const ensure = (m: string) => { if (!months[m]) months[m] = { prodQty: 0, prodProfit: 0, prodCost: 0, svcQty: 0, svcProfit: 0, svcCost: 0, clients: [] }; };

    productSales.forEach(p => {
      const m = getMonthKey(p.saleDate);
      ensure(m);
      months[m].prodQty += p.quantity;
      months[m].prodProfit += p.profit;
      months[m].prodCost += p.totalCost + p.externalCosts;
      months[m].clients.push(p.clientName);
    });

    serviceSales.forEach(s => {
      const m = getMonthKey(s.saleDate);
      ensure(m);
      months[m].svcQty += s.quantity;
      months[m].svcProfit += s.profit;
      months[m].svcCost += s.totalCost + s.externalCosts;
      months[m].clients.push(s.clientName);
    });

    return Object.entries(months).map(([month, d]) => {
      const clientCount: Record<string, number> = {};
      d.clients.forEach(c => { clientCount[c] = (clientCount[c] || 0) + 1; });
      const topClient = Object.entries(clientCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
      return { month, ...d, totalQty: d.prodQty + d.svcQty, totalProfit: d.prodProfit + d.svcProfit, totalCost: d.prodCost + d.svcCost, topClient };
    });
  }, [productSales, serviceSales]);

  const chartData = report.map(r => ({ mes: r.month.slice(0, 3), ventas: r.totalQty, ganancias: r.totalProfit }));

  const Card = ({ title, data }: { title: string; data: { month: string; qty: number; profit: number; cost: number; topClient: string }[] }) => (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">{title}</h3>
      {data.length === 0 ? <p className="text-muted-foreground text-sm text-center py-4">Sin datos</p> :
        data.map((r, i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-2">
            <p className="text-foreground font-medium">{r.month}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><p className="text-muted-foreground text-xs">Cantidad</p><p className="text-foreground font-medium">{r.qty}</p></div>
              <div><p className="text-muted-foreground text-xs">Ganancias</p><p className="text-success font-medium">${r.profit.toLocaleString()}</p></div>
              <div><p className="text-muted-foreground text-xs">Gastos</p><p className="text-destructive font-medium">${r.cost.toLocaleString()}</p></div>
              <div><p className="text-muted-foreground text-xs">Cliente top</p><p className="text-foreground font-medium">{r.topClient}</p></div>
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Reporte Mensual</h1>

      {chartData.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Resumen mensual</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Productos" data={report.map(r => ({ month: r.month, qty: r.prodQty, profit: r.prodProfit, cost: r.prodCost, topClient: r.topClient }))} />
        <Card title="Servicios Digitales" data={report.map(r => ({ month: r.month, qty: r.svcQty, profit: r.svcProfit, cost: r.svcCost, topClient: r.topClient }))} />
        <Card title="Total General" data={report.map(r => ({ month: r.month, qty: r.totalQty, profit: r.totalProfit, cost: r.totalCost, topClient: r.topClient }))} />
      </div>
    </div>
  );
}
