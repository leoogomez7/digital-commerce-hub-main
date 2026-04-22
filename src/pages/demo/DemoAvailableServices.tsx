import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Monitor, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DemoAvailableServices() {
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("demo_available_services") || "[]");
      setServices(Array.isArray(saved) ? saved : []);
    } catch (e) {
      console.error("Error al cargar servicios", e);
      setServices([]);
    }
  }, []);

  const buildServiceDisplay = (s: any) => 
    `${s.name || 'Sin nombre'} | ${s.months || '1'} meses | ${s.email || 'Sin correo'}`;

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return services.filter(sv => buildServiceDisplay(sv).toLowerCase().includes(s));
  }, [services, search]);

  const deleteService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    sessionStorage.setItem("demo_available_services", JSON.stringify(updated));
    toast.success("Servicio eliminado");
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <h1 className="text-2xl font-bold text-foreground">Inventario (Demo)</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Buscar por nombre o correo..." 
          className="pl-9 bg-muted border-border h-10" 
        />
      </div>

      <div className="glass-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Datos del servicio", "Stock", "Costo unit.", "Costo total", "Acciones"].map(h => (
                  <th key={h} className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    <Monitor className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    No hay servicios en el inventario.
                  </td>
                </tr>
              ) : filtered.map(s => {
                // Cálculo seguro en tiempo real para evitar fallos del storage
                const unitCost = Number(s.unitCost) || 0;
                // Al poner s.stock primero, JS usará el valor que se descuenta en las ventas
                const quantity = Number(s.stock ?? s.quantity) || 0;
                const totalCost = unitCost * quantity;

                return (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{s.name || 'Servicio'}</div>
                      <div className="text-[11px] text-muted-foreground">{s.email || 'Sin cuenta'} • {s.months || 1} meses</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${quantity > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        {quantity}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground font-mono">${unitCost.toLocaleString()}</td>
                    <td className="px-4 py-4 font-bold text-foreground font-mono">
                      ${totalCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteService(s.id)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
