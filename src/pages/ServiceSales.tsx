import { useState, useMemo, useEffect } from "react";
// --- NUBE ---
import { client } from "@/lib/db";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
// ------------
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Trash2, Edit, Monitor, Save, X, Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ServiceSales() {
  const { user } = useKindeAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 1. CARGAR VENTAS DESDE TURSO
  const fetchSales = async () => {
    if (!user?.id) return;
    try {
      const res = await client.execute({
        sql: "SELECT * FROM service_sales WHERE user_id = ? ORDER BY createdAt DESC",
        args: [user.id]
      });
      setSales(res.rows);
    } catch (err) {
      toast.error("Error al cargar ventas de servicios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [user]);

  // Filtrado en memoria
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return sales.filter(sv => 
      !s || 
      sv.clientName?.toLowerCase().includes(s) || 
      sv.serviceData?.toLowerCase().includes(s)
    );
  }, [sales, search]);

  const startEdit = (s: any) => { setEditId(s.id); setEditForm({ ...s }); };
  const cancelEdit = () => setEditId(null);

  // 2. GUARDAR EDICIÓN EN TURSO
  const saveEdit = async () => {
    const totalCost = editForm.quantity * (editForm.unitCost || 0);
    const profit = editForm.salePrice - totalCost - editForm.externalCosts;

    try {
      await client.execute({
        sql: `UPDATE service_sales SET 
                clientName = ?, externalCosts = ?, salePrice = ?, 
                profit = ?, totalCost = ?, saleDate = ? 
              WHERE id = ? AND user_id = ?`,
        args: [
          editForm.clientName, editForm.externalCosts, editForm.salePrice,
          profit, totalCost, editForm.saleDate, editForm.id, user?.id
        ]
      });
      toast.success("Venta de servicio actualizada");
      fetchSales(); // Recargar datos de la nube
      setEditId(null);
    } catch (err) {
      toast.error("Error al actualizar");
    }
  };

  // 3. ELIMINAR DE TURSO
  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await client.execute({
          sql: "DELETE FROM service_sales WHERE id = ? AND user_id = ?",
          args: [deleteId, user?.id]
        });
        toast.success("Venta eliminada permanentemente");
        fetchSales();
      } catch (err) {
        toast.error("Error al eliminar");
      }
    }
    setDeleteId(null);
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString('es-AR');
  };

  const ic = "bg-muted border-border text-foreground h-8 text-sm";

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Sincronizando servicios con la nube...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <h1 className="text-2xl font-bold text-foreground">Servicios Digitales Vendidos</h1>
      
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Buscar por cliente o tipo de servicio..." 
            className="pl-9 bg-muted border-border text-foreground h-9 text-sm" 
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Cliente", "Servicio", "Cant.", "Costo total", "G. externos", "Precio venta", "Ganancia", "Fecha venta", "Acciones"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground">
                    <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No hay registros de servicios vendidos
                  </td>
                </tr>
              ) : filtered.map(s => editId === s.id ? (
                <tr key={s.id} className="border-b border-border/50 bg-muted/20">
                  <td className="px-4 py-2"><Input value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})} className={ic} /></td>
                  <td className="px-4 py-2 text-foreground text-xs">{s.serviceData}</td>
                  <td className="px-4 py-2 text-foreground text-xs">{s.quantity}</td>
                  <td className="px-4 py-2 text-foreground text-xs">${(s.quantity * s.unitCost).toLocaleString()}</td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.externalCosts} onChange={e => setEditForm({...editForm, externalCosts: +e.target.value})} className={`${ic} w-16`} /></td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.salePrice} onChange={e => setEditForm({...editForm, salePrice: +e.target.value})} className={`${ic} w-20`} /></td>
                  <td className="px-4 py-2 text-foreground font-bold text-xs">
                    ${(editForm.salePrice - (s.quantity * s.unitCost) - editForm.externalCosts).toLocaleString()}
                  </td>
                  <td className="px-4 py-2"><Input type="date" value={editForm.saleDate} onChange={e => setEditForm({...editForm, saleDate: e.target.value})} className={ic} /></td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={saveEdit} className="h-7 w-7 text-green-500"><Save className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-7 w-7 text-muted-foreground"><X className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-foreground">{s.clientName}</td>
                  <td className="px-4 py-3 text-foreground">{s.serviceData}</td>
                  <td className="px-4 py-3 text-center">{s.quantity}</td>
                  <td className="px-4 py-3 text-foreground">${s.totalCost}</td>
                  <td className="px-4 py-3 text-muted-foreground">${s.externalCosts}</td>
                  <td className="px-4 py-3 text-foreground">${s.salePrice}</td>
                  <td className={`px-4 py-3 font-bold ${s.profit >= 0 ? 'text-green-500' : 'text-destructive'}`}>${s.profit}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(s.saleDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(s)} className="h-7 w-7 text-muted-foreground hover:text-foreground"><Edit className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(s.id)} className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio vendido?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción borrará el dato de la nube permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
