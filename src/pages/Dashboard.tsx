import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { client } from "@/lib/db"; // Importamos Turso
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Monitor, 
  ShoppingCart,
  Loader2 
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function Dashboard() {
  const { isAuthenticated, isLoading, user } = useKindeAuth();
  const navigate = useNavigate();
  
  const [productSales, setProductSales] = useState<any[]>([]);
  const [serviceSales, setServiceSales] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // 1. Redirección de seguridad
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 2. CARGAR DATOS DESDE TURSO
  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id) return;
      try {
        // Ejecutamos ambas consultas en paralelo para mayor velocidad
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
        console.error("Error cargando dashboard:", err);
      } finally {
        setIsFetching(false);
      }
    }

    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  // 3. Cálculo de estadísticas (Memoizado)
  const stats = useMemo(() => {
    const totalProductQty = productSales.reduce((s, p) => s + Number(p.quantity), 0);
    const totalServiceQty = serviceSales.reduce((s, sv) => s + Number(sv.quantity), 0);
    const totalQty = totalProductQty + totalServiceQty;

    const totalProductProfit = productSales.reduce((s, p) => s + Number(p.profit), 0);
    const totalServiceProfit = serviceSales.reduce((s, sv) => s + Number(sv.profit), 0);
    const totalProfit = totalProductProfit + totalServiceProfit;

    const totalProductCost = productSales.reduce((s, p) => s + Number(p.totalCost) + Number(p.externalCosts), 0);
    const totalServiceCost = serviceSales.reduce((s, sv) => s + Number(sv.totalCost) + Number(sv.externalCosts), 0);
    const totalCost = totalProductCost + totalServiceCost;

    // Cliente más activo
    const clientCount: Record<string, number> = {};
    productSales.forEach(p => { clientCount[p.clientName] = (clientCount[p.clientName] || 0) + Number(p.quantity); });
    serviceSales.forEach(s => { clientCount[s.clientName] = (clientCount[s.clientName] || 0) + Number(s.quantity); });
    const topEntry = Object.entries(clientCount).sort((a, b) => b[1] - a[1])[0];
    const topClient = topEntry ? `${topEntry[0]} - ${topEntry[1]} ventas` : "—";

    return { totalQty, totalProfit, totalCost, totalProductQty, totalServiceQty, totalProductProfit, totalServiceProfit, topClient };
  }, [productSales, serviceSales]);

  // 4. Preparación de datos para los gráficos
  const monthlyData = useMemo(() => {
    const months: Record<string, { cantidad: number; ganancias: number }> = {};
    const add = (date: string, qty: number, profit: number) => {
      const m = date?.slice(0, 7) || "sin-fecha";
      if (!months[m]) months[m] = { cantidad: 0, ganancias: 0 };
      months[m].cantidad += Number(qty);
      months[m].ganancias += Number(profit);
    };
    productSales.forEach(p => add(p.saleDate, p.quantity, p.profit));
    serviceSales.forEach(s => add(s.saleDate, s.quantity, s.profit));
    return Object.entries(months).sort().slice(-12).map(([m, d]) => ({ mes: m, ...d }));
  }, [productSales, serviceSales]);

  // 5. Pantalla de carga
  if (isLoading || isFetching) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Sincronizando con la nube...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const cards = [
    { label: "Ventas totales", value: stats.totalQty.toString(), icon: ShoppingCart, color: "text-primary" },
    { label: "Ganancias totales", value: `$${stats.totalProfit.toLocaleString()}`, icon: TrendingUp, color: "text-green-500" },
    { label: "Gastos totales", value: `$${stats.totalCost.toLocaleString()}`, icon: TrendingDown, color: "text-destructive" },
    { label: "Ventas productos", value: stats.totalProductQty.toString(), icon: Package, color: "text-primary" },
    { label: "Ventas servicios", value: stats.totalServiceQty.toString(), icon: Monitor, color: "text-primary" },
    { label: "Ganancia productos", value: `$${stats.totalProductProfit.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
    { label: "Ganancia servicios", value: `$${stats.totalServiceProfit.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
    { label: "Cliente más activo", value: stats.topClient, icon: Users, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <h1 className="text-2xl font-bold text-foreground">Panel Principal</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase font-semibold">{c.label}</span>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Ganancias mensuales ($)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis dataKey="mes" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(222,47%,9%)', 
                    border: '1px solid hsl(217,33%,17%)', 
                    borderRadius: 8, 
                    color: 'hsl(210,40%,98%)' 
                  }} 
                />
                <Line type="monotone" dataKey="ganancias" stroke="hsl(142,76%,36%)" strokeWidth={2} dot={{ fill: 'hsl(142,76%,36%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Ventas mensuales (unidades)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                <XAxis dataKey="mes" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(222,47%,9%)', 
                    border: '1px solid hsl(217,33%,17%)', 
                    borderRadius: 8, 
                    color: 'hsl(210,40%,98%)' 
                  }} 
                />
                <Bar dataKey="cantidad" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

