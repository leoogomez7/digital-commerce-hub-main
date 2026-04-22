import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Trash2, Edit, Monitor, Save, X, Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Sale {
  id: string;
  clientName: string;
  serviceData: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  externalCosts: number;
  salePrice: number;
  profit: number;
  saleDate: string;
}

export default function DemoServiceSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Sale>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedSales = JSON.parse(sessionStorage.getItem("demo_service_sales") || "[]");
        setSales(savedSales);
      } catch (e) {
        console.error("Error cargando ventas", e);
      }
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return sales.filter(sv => 
      !s || 
      sv.clientName?.toLowerCase().includes(s) || 
      sv.serviceData?.toLowerCase().includes(s)
    );
  }, [sales, search]);

  const startEdit = (s: Sale) => { 
    setEditId(s.id); 
    setEditForm({ ...s }); 
  };

  const saveEdit = () => {
    const quantity = editForm.quantity || 0;
    const unitCost = editForm.unitCost || 0;
    const salePrice = editForm.salePrice || 0;
    const externalCosts = editForm.externalCosts || 0;

    const totalCost = quantity * unitCost;
    const profit = salePrice - totalCost - externalCosts;

    const updatedSales = sales.map(s => 
      s.id === editId ? { ...s, ...editForm, totalCost, profit } as Sale : s
    );
    
    setSales(updatedSales);
    sessionStorage.setItem("demo_service_sales", JSON.stringify(updatedSales));
    toast.success("Venta actualizada");
    setEditId(null);
  };

  const confirmDelete = () => {
    const updatedSales = sales.filter(s => s.id !== deleteId);
    setSales(updatedSales);
    sessionStorage.setItem("demo_service_sales", JSON.stringify(updatedSales));
    toast.success("Registro eliminado");
    setDeleteId(null);
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    // Corregimos para evitar desfase de zona horaria en el input date
    return new Date(date + 'T12:00:00').toLocaleDateString('es-AR');
  };

  const ic = "bg-muted border-border text-foreground h-8 text-sm";

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Sincronizando registros...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historial de Ventas</h1>
          <p className="text-xs text-muted-foreground">Monitoreo de ingresos y rentabilidad</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
          sales.length === 0 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
        }`}>
          {sales.length === 0 ? "Sin Registros" : `${sales.length} Ventas`}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Buscar por cliente o servicio..." 
            className="pl-9 h-10" 
          />
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Cliente", "Servicio", "Cant.", "Costo", "G. Ext.", "Venta", "Ganancia", "Fecha", "Acciones"].map(h => (
                  <th key={h} className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-20 text-muted-foreground">
                    <Monitor className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No se encontraron registros de ventas.</p>
                  </td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} className={`hover:bg-muted/20 transition-colors ${editId === s.id ? 'bg-primary/5' : ''}`}>
                  {editId === s.id ? (
                    <>
                      <td className="px-4 py-2"><Input value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})} className={ic} /></td>
                      <td className="px-4 py-2 text-xs font-medium">{s.serviceData}</td>
                      <td className="px-4 py-2 text-center text-xs">{s.quantity}</td>
                      <td className="px-4 py-2 text-xs font-mono">${(s.quantity * (s.unitCost || 0)).toLocaleString()}</td>
                      <td className="px-4 py-2"><Input type="number" value={editForm.externalCosts} onChange={e => setEditForm({...editForm, externalCosts: +e.target.value})} className={`${ic} w-20`} /></td>
                      <td className="px-4 py-2"><Input type="number" value={editForm.salePrice} onChange={e => setEditForm({...editForm, salePrice: +e.target.value})} className={`${ic} w-24`} /></td>
                      <td className="px-4 py-2 font-bold text-xs text-primary">
                        ${((editForm.salePrice || 0) - (s.quantity * (s.unitCost || 0)) - (editForm.externalCosts || 0)).toLocaleString()}
                      </td>
                      <td className="px-4 py-2"><Input type="date" value={editForm.saleDate} onChange={e => setEditForm({...editForm, saleDate: e.target.value})} className={ic} /></td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button size="icon" variant="default" onClick={saveEdit} className="h-8 w-8"><Save className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditId(null)} className="h-8 w-8"><X className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 font-medium">{s.clientName}</td>
                      <td className="px-4 py-4 text-muted-foreground">{s.serviceData}</td>
                      <td className="px-4 py-4 text-center">{s.quantity}</td>
                      <td className="px-4 py-4 font-mono text-xs">${s.totalCost.toLocaleString()}</td>
                      <td className="px-4 py-4 text-muted-foreground font-mono text-xs">${s.externalCosts.toLocaleString()}</td>
                      <td className="px-4 py-4 font-semibold">${s.salePrice.toLocaleString()}</td>
                      <td className={`px-4 py-4 font-bold ${s.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        ${s.profit.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs">{formatDate(s.saleDate)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => startEdit(s)} className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteId(s.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
