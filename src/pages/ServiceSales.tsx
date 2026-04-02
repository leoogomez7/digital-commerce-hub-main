import { useState, useMemo } from "react";
import { getServiceSales, deleteServiceSale, updateServiceSale, getAvailableServices, updateAvailableService, buildServiceData
} from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Trash2, Edit, Monitor, Save, X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ServiceSales() {
  const [sales, setSales] = useState(getServiceSales());
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return sales.filter(sv => !s || sv.clientName.toLowerCase().includes(s) || sv.serviceData.toLowerCase().includes(s));
  }, [sales, search]);

  const startEdit = (s: any) => { setEditId(s.id); setEditForm({ ...s }); };
  const cancelEdit = () => setEditId(null);
const saveEdit = () => {
  updateServiceSale(editForm);

  setSales(getServiceSales());
  setEditId(null);

  toast.success("Venta actualizada");
};
  const confirmDelete = () => {
    if (deleteId) { deleteServiceSale(deleteId); setSales(getServiceSales()); toast.success("Venta eliminada"); }
    setDeleteId(null);
  };

  const ic = "bg-muted border-border text-foreground h-8 text-sm";

  const formatDate = (date: string) => {
  if (!date) return "—";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Servicios Digitales Vendidos</h1>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente, servicio..." className="pl-9 bg-muted border-border text-foreground h-9 text-sm" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Cliente", "Servicio (Tipo | Meses | Correo | Contraseña | Codigos)", "Cantidad", "Gasto unitario", "Gasto total", "Gastos externos", "Precio venta", "Ganancia", "Fecha venta", "Red Social de venta", "Acciones"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-muted-foreground">
                  <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />No hay ventas registradas
                </td></tr>
              ) : filtered.map(s => editId === s.id ? (
                <tr key={s.id} className="border-b border-border/50 bg-muted/20">
                  <td className="px-4 py-2"><Input value={editForm.clientName} onChange={e => setEditForm((f: any) => ({ ...f, clientName: e.target.value }))} className={ic} /></td>
                  <td className="px-4 py-2 text-foreground">{s.serviceData}</td>
                  <td className="px-4 py-2 text-foreground">{s.quantity}</td>
                  <td className="px-4 py-2 text-foreground">${editForm.unitCost}</td>
                  <td className="px-4 py-2 text-foreground">${(editForm.quantity * editForm.unitCost).toLocaleString()}</td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.externalCosts} onChange={e => setEditForm((f: any) => ({ ...f, externalCosts: +e.target.value }))} className={`${ic} w-20`} /></td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.salePrice} onChange={e => setEditForm((f: any) => ({ ...f, salePrice: +e.target.value }))} className={`${ic} w-24`} /></td>
                  <td className="px-4 py-2 text-foreground">${(editForm.salePrice - editForm.quantity * editForm.unitCost - editForm.externalCosts).toLocaleString()}</td>
                  <td className="px-4 py-2"><Input type="date" value={editForm.saleDate} onChange={e => setEditForm((f: any) => ({ ...f, saleDate: e.target.value }))} className={ic} /></td>
                  <td className="px-4 py-2 text-muted-foreground">{s.salesChannel}</td>                  <td className="px-4 py-2"><div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={saveEdit} className="h-7 w-7 text-success"><Save className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-7 w-7 text-muted-foreground"><X className="h-3 w-3" /></Button>
                  </div></td>
                </tr>
              ) : (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-foreground">{s.clientName}</td>
                  <td className="px-4 py-3 text-foreground">{s.serviceData}</td>
                  <td className="px-4 py-3 text-foreground">{s.quantity}</td>
                  <td className="px-4 py-3 text-foreground">${s.unitCost}</td>
                  <td className="px-4 py-3 text-foreground">${s.totalCost}</td>
                  <td className="px-4 py-3 text-muted-foreground">${s.externalCosts}</td>
                  <td className="px-4 py-3 text-foreground">${s.salePrice}</td>
                  <td className={`px-4 py-3 font-medium ${s.profit >= 0 ? 'text-success' : 'text-destructive'}`}>${s.profit}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.saleDate)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.salesChannel}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(s)} className="h-7 w-7 text-muted-foreground hover:text-foreground"><Edit className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(s.id)} className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Eliminar esta venta?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
