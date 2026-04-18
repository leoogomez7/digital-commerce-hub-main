import { useState, useMemo, useEffect } from "react";
// --- CONEXIÓN NUBE ---
import { client } from "@/lib/db";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
// ---------------------
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Trash2, Edit, Monitor, Save, X, Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AvailableServices() {
  const { user } = useKindeAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 1. CARGAR SERVICIOS DESDE TURSO
  const fetchServices = async () => {
    if (!user?.id) return;
    try {
      const res = await client.execute({
        sql: "SELECT * FROM available_services WHERE user_id = ? ORDER BY createdAt DESC",
        args: [user.id]
      });
      setServices(res.rows);
    } catch (err) {
      toast.error("Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  // Función para construir el string de visualización (Tipo | Meses | Correo)
  const buildServiceDisplay = (s: any) => {
    return `${s.name || ''} | ${s.months || '1'} meses | ${s.email || ''}`;
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return services.filter(sv => 
      !s || 
      buildServiceDisplay(sv).toLowerCase().includes(s) || 
      (sv.supplierName && sv.supplierName.toLowerCase().includes(s))
    );
  }, [services, search]);

  const startEdit = (s: any) => { setEditId(s.id); setEditForm({ ...s }); };
  const cancelEdit = () => { setEditId(null); setEditForm({}); };

  // 2. GUARDAR EDICIÓN EN TURSO
  const saveEdit = async () => {
    const totalCost = editForm.quantity * editForm.unitCost;
    try {
      await client.execute({
        sql: `UPDATE available_services SET 
                name = ?, months = ?, email = ?, password = ?, 
                accessCodes = ?, quantity = ?, unitCost = ?, 
                totalCost = ?, supplierName = ?, purchaseDate = ? 
              WHERE id = ? AND user_id = ?`,
        args: [
          editForm.name, editForm.months, editForm.email, editForm.password,
          editForm.accessCodes, editForm.quantity, editForm.unitCost, totalCost,
          editForm.supplierName, editForm.purchaseDate, editForm.id, user?.id
        ]
      });
      toast.success("Servicio actualizado en la nube");
      fetchServices();
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
          sql: "DELETE FROM available_services WHERE id = ? AND user_id = ?",
          args: [deleteId, user?.id]
        });
        toast.success("Servicio eliminado");
        fetchServices();
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

  const ic = "bg-muted border-border text-foreground h-8 text-sm w-full";

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Cargando servicios...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <h1 className="text-2xl font-bold text-foreground">Servicios Digitales Disponibles</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Buscar servicio, correo o proveedor..." 
          className="pl-9 bg-muted border-border text-foreground h-9 text-sm" 
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Datos del servicio", "Cant.", "G. unitario", "G. total", "Proveedor", "Fecha compra", "Acciones"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No hay servicios disponibles
                  </td>
                </tr>
              ) : filtered.map(s => editId === s.id ? (
                <tr key={s.id} className="border-b border-border/50 bg-muted/20">
                  <td className="px-4 py-2 space-y-1 min-w-[300px]">
                    <Input placeholder="Tipo" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className={ic} />
                    <div className="flex gap-1">
                      <Input placeholder="Meses" type="number" value={editForm.months} onChange={e => setEditForm({...editForm, months: +e.target.value})} className={ic} />
                      <Input placeholder="Correo" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className={ic} />
                    </div>
                  </td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: +e.target.value})} className="h-8 w-16 bg-muted border-border" /></td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.unitCost} onChange={e => setEditForm({...editForm, unitCost: +e.target.value})} className="h-8 w-20 bg-muted border-border" /></td>
                  <td className="px-4 py-2 text-foreground font-bold">${(editForm.quantity * editForm.unitCost).toLocaleString()}</td>
                  <td className="px-4 py-2"><Input value={editForm.supplierName} onChange={e => setEditForm({...editForm, supplierName: e.target.value})} className={ic} /></td>
                  <td className="px-4 py-2"><Input type="date" value={editForm.purchaseDate} onChange={e => setEditForm({...editForm, purchaseDate: e.target.value})} className={ic} /></td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={saveEdit} className="h-7 w-7 text-green-500"><Save className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-7 w-7 text-muted-foreground"><X className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-foreground">{buildServiceDisplay(s)}</td>
                  <td className="px-4 py-3 text-foreground font-medium text-center">{s.quantity}</td>
                  <td className="px-4 py-3 text-foreground">${s.unitCost}</td>
                  <td className="px-4 py-3 text-foreground font-bold">${s.totalCost}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.supplierName || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(s.purchaseDate)}</td>
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
            <AlertDialogTitle>¿Eliminar este servicio?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción es permanente y afectará a todos tus dispositivos.</AlertDialogDescription>
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
