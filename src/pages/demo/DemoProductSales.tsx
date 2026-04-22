import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Trash2, Edit, Monitor, Save, X, Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DemoProductSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

useEffect(() => {
  const timer = setTimeout(() => {
    try {
      // Solo lee las ventas reales que registres
      const savedSales = JSON.parse(sessionStorage.getItem("demo_product_sales") || "[]");
      setSales(savedSales);
    } catch (e) {
      console.error("Error cargando ventas", e);
      setSales([]);
    }
    setLoading(false);
  }, 800);
  return () => clearTimeout(timer);
}, []);


  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return sales.filter(p => 
      !s || 
      p.clientName?.toLowerCase().includes(s) || 
      p.productData?.toLowerCase().includes(s)
    );
  }, [sales, search]);

  const startEdit = (p: any) => { 
    setEditId(p.id); 
    setEditForm({ ...p, unitPrice: p.unitPrice || (p.salePrice / p.quantity) }); 
  };
  
  const cancelEdit = () => setEditId(null);

  const saveEdit = () => {
    const quantity = editForm.quantity || 0;
    const unitCost = editForm.unitCost || 0;
    const unitPrice = editForm.unitPrice || 0;
    const externalCosts = editForm.externalCosts || 0;

    const totalCost = quantity * unitCost;
    const totalSalePrice = quantity * unitPrice;
    const profit = totalSalePrice - totalCost - externalCosts;

    const updatedSales = sales.map(s => 
      s.id === editId ? { ...editForm, totalCost, salePrice: totalSalePrice, profit } : s
    );
    
    setSales(updatedSales);
    sessionStorage.setItem("demo_product_sales", JSON.stringify(updatedSales));
    toast.success("Venta actualizada");
    setEditId(null);
  };

  const confirmDelete = () => {
    const updatedSales = sales.filter(s => s.id !== deleteId);
    setSales(updatedSales);
    sessionStorage.setItem("demo_product_sales", JSON.stringify(updatedSales));
    toast.success("Venta eliminada");
    setDeleteId(null);
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date + 'T12:00:00').toLocaleDateString('es-AR');
  };

  const ic = "bg-muted border-border text-foreground h-8 text-sm";

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Consultando historial demo...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Productos Vendidos (DEMO)</h1>
        <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded uppercase font-bold tracking-widest">Simulador</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Buscar por cliente o producto..." 
            className="pl-9 h-10" 
          />
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Cliente", "Producto", "Cant.", "P. Unit", "Total Venta", "Ganancia", "Fecha", "Acciones"].map(h => (
                  <th key={h} className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-20 text-muted-foreground italic">No hay ventas registradas</td></tr>
              ) : filtered.map(p => editId === p.id ? (
                <tr key={p.id} className="bg-primary/5">
                  <td className="px-4 py-2"><Input value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})} className={ic} /></td>
                  <td className="px-4 py-2 text-xs">{p.productData}</td>
                  <td className="px-4 py-2 text-center text-xs">{p.quantity}</td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.unitPrice} onChange={e => setEditForm({...editForm, unitPrice: +e.target.value})} className={`${ic} w-20`} /></td>
                  <td className="px-4 py-2 font-bold text-xs">
                    ${((editForm.unitPrice || 0) * (p.quantity || 0)).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 font-bold text-xs text-primary">
                    ${((editForm.unitPrice || 0) * (p.quantity || 0) - p.totalCost - (editForm.externalCosts || 0)).toLocaleString()}
                  </td>
                  <td className="px-4 py-2"><Input type="date" value={editForm.saleDate} onChange={e => setEditForm({...editForm, saleDate: e.target.value})} className={ic} /></td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="icon" onClick={saveEdit} className="h-8 w-8"><Save className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8"><X className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-4 font-medium">{p.clientName}</td>
                  <td className="px-4 py-4 text-muted-foreground">{p.productData}</td>
                  <td className="px-4 py-4 text-center">{p.quantity}</td>
                  <td className="px-4 py-4 font-mono text-xs">${(p.unitPrice || (p.salePrice / p.quantity)).toLocaleString()}</td>
                  <td className="px-4 py-4 font-semibold">${p.salePrice.toLocaleString()}</td>
                  <td className={`px-4 py-4 font-bold ${p.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>${p.profit.toLocaleString()}</td>
                  <td className="px-4 py-4 text-muted-foreground text-xs">{formatDate(p.saleDate)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(p)} className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(p.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
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
            <AlertDialogDescription>Esta acción eliminará la venta de forma permanente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
