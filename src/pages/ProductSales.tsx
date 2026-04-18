import { useState, useMemo, useEffect } from "react";
// --- NUBE ---
import { client } from "@/lib/db";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
// ------------
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Trash2, Edit, Package, Save, X, Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductSales() {
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
        sql: "SELECT * FROM product_sales WHERE user_id = ? ORDER BY createdAt DESC",
        args: [user.id]
      });
      setSales(res.rows);
    } catch (err) {
      toast.error("Error al cargar ventas");
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
    return sales.filter(p => 
      !s || 
      p.clientName?.toLowerCase().includes(s) || 
      p.productData?.toLowerCase().includes(s)
    );
  }, [sales, search]);

  const startEdit = (p: any) => { setEditId(p.id); setEditForm({ ...p }); };
  const cancelEdit = () => setEditId(null);

  // 2. GUARDAR EDICIÓN EN TURSO
  const saveEdit = async () => {
    const totalCost = editForm.quantity * (editForm.unitCost || 0);
    const profit = editForm.salePrice - totalCost - editForm.externalCosts;

    try {
      await client.execute({
        sql: `UPDATE product_sales SET 
                clientName = ?, externalCosts = ?, salePrice = ?, 
                profit = ?, totalCost = ?, saleDate = ? 
              WHERE id = ? AND user_id = ?`,
        args: [
          editForm.clientName, editForm.externalCosts, editForm.salePrice,
          profit, totalCost, editForm.saleDate, editForm.id, user?.id
        ]
      });
      toast.success("Venta actualizada");
      fetchSales(); // Recargar datos
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
          sql: "DELETE FROM product_sales WHERE id = ? AND user_id = ?",
          args: [deleteId, user?.id]
        });
        toast.success("Venta eliminada");
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
      <p className="text-muted-foreground text-sm">Consultando base de datos...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <h1 className="text-2xl font-bold text-foreground">Productos Vendidos</h1>
      
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Buscar cliente o producto..." 
            className="pl-9 bg-muted border-border text-foreground h-9 text-sm" 
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Cliente", "Producto", "Cant.", "Costo total", "G. externos", "Precio venta", "Ganancia", "Fecha venta", "Acciones"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No se encontraron ventas
                  </td>
                </tr>
              ) : filtered.map(p => editId === p.id ? (
                <tr key={p.id} className="border-b border-border/50 bg-muted/20">
                  <td className="px-4 py-2"><Input value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})} className={ic} /></td>
                  <td className="px-4 py-2 text-foreground text-xs">{p.productData}</td>
                  <td className="px-4 py-2 text-foreground text-xs">{p.quantity}</td>
                  <td className="px-4 py-2 text-foreground text-xs">${(p.quantity * p.unitCost).toLocaleString()}</td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.externalCosts} onChange={e => setEditForm({...editForm, externalCosts: +e.target.value})} className={`${ic} w-16`} /></td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.salePrice} onChange={e => setEditForm({...editForm, salePrice: +e.target.value})} className={`${ic} w-20`} /></td>
                  <td className="px-4 py-2 text-foreground font-bold text-xs">
                    ${(editForm.salePrice - (p.quantity * p.unitCost) - editForm.externalCosts).toLocaleString()}
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
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-foreground">{p.clientName}</td>
                  <td className="px-4 py-3 text-foreground">{p.productData}</td>
                  <td className="px-4 py-3 text-center">{p.quantity}</td>
                  <td className="px-4 py-3 text-foreground">${p.totalCost}</td>
                  <td className="px-4 py-3 text-muted-foreground">${p.externalCosts}</td>
                  <td className="px-4 py-3 text-foreground">${p.salePrice}</td>
                  <td className={`px-4 py-3 font-bold ${p.profit >= 0 ? 'text-green-500' : 'text-destructive'}`}>${p.profit}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(p.saleDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(p)} className="h-7 w-7 text-muted-foreground hover:text-foreground"><Edit className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(p.id)} className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></Button>
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
            <AlertDialogTitle>¿Eliminar venta de la nube?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción es irreversible y borrará el registro en todos tus dispositivos.</AlertDialogDescription>
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
