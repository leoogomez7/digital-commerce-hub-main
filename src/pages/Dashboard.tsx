import { getProductSales, getServiceSales } from "@/lib/store";
import { useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, Users, Package, Monitor, ShoppingCart } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const productSales = getProductSales();
  const serviceSales = getServiceSales();

  const stats = useMemo(() => {
    const totalProductQty = productSales.reduce((s, p) => s + p.quantity, 0);
    const totalServiceQty = serviceSales.reduce((s, sv) => s + sv.quantity, 0);
    const totalQty = totalProductQty + totalServiceQty;

    const totalProductProfit = productSales.reduce((s, p) => s + p.profit, 0);
    const totalServiceProfit = serviceSales.reduce((s, sv) => s + sv.profit, 0);
    const totalProfit = totalProductProfit + totalServiceProfit;

    const totalProductCost = productSales.reduce((s, p) => s + p.totalCost + p.externalCosts, 0);
    const totalServiceCost = serviceSales.reduce((s, sv) => s + sv.totalCost + sv.externalCosts, 0);
    const totalCost = totalProductCost + totalServiceCost;

    // Cliente más activo
    const clientCount: Record<string, number> = {};
    productSales.forEach(p => { clientCount[p.clientName] = (clientCount[p.clientName] || 0) + p.quantity; });
    serviceSales.forEach(s => { clientCount[s.clientName] = (clientCount[s.clientName] || 0) + s.quantity; });
    const topEntry = Object.entries(clientCount).sort((a, b) => b[1] - a[1])[0];
    const topClient = topEntry ? `${topEntry[0]} - ${topEntry[1]} compras` : "—";

    return { totalQty, totalProfit, totalCost, totalProductQty, totalServiceQty, totalProductProfit, totalServiceProfit, topClient };
  }, [productSales, serviceSales]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { cantidad: number; ganancias: number }> = {};
    const add = (date: string, qty: number, profit: number) => {
      const m = date?.slice(0, 7) || "sin-fecha";
      if (!months[m]) months[m] = { cantidad: 0, ganancias: 0 };
      months[m].cantidad += qty;
      months[m].ganancias += profit;
    };
    productSales.forEach(p => add(p.saleDate, p.quantity, p.profit));
    serviceSales.forEach(s => add(s.saleDate, s.quantity, s.profit));
    return Object.entries(months).sort().slice(-12).map(([m, d]) => ({ mes: m, ...d }));
  }, [productSales, serviceSales]);

  const cards = [
    { label: "Cantidad de ventas totales", value: stats.totalQty.toString(), icon: ShoppingCart, color: "text-primary" },
    { label: "Ganancias totales", value: `$${stats.totalProfit.toLocaleString()}`, icon: TrendingUp, color: "text-success" },
    { label: "Gastos totales", value: `$${stats.totalCost.toLocaleString()}`, icon: TrendingDown, color: "text-destructive" },
    { label: "Ventas productos", value: stats.totalProductQty.toString(), icon: Package, color: "text-primary" },
    { label: "Ventas de servicios digitales", value: stats.totalServiceQty.toString(), icon: Monitor, color: "text-primary" },
    { label: "Ganancias en productos", value: `$${stats.totalProductProfit.toLocaleString()}`, icon: DollarSign, color: "text-success" },
    { label: "Ganancias en servicios digitales", value: `$${stats.totalServiceProfit.toLocaleString()}`, icon: DollarSign, color: "text-success" },
    { label: "Cliente más activo", value: stats.topClient, icon: Users, color: "text-warning" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Panel Principal</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Ganancias mensuales en ganancias ($) en productos y servicios digitales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis dataKey="mes" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,98%)' }} />
                <Line type="monotone" dataKey="ganancias" stroke="hsl(142,76%,36%)" strokeWidth={2} dot={{ fill: 'hsl(142,76%,36%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Cantidad de ventas mensuales en productos y servicios digitales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis dataKey="mes" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, color: 'hsl(210,40%,98%)' }} />
                <Bar dataKey="cantidad" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
