import { useState, useMemo } from "react";
import { getAvailableProducts, deleteAvailableProduct, updateAvailableProduct, buildProductData } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Trash2, Edit, Package, Save, X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AvailableProducts() {
  const [products, setProducts] = useState(getAvailableProducts());
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(p => !s || buildProductData(p).toLowerCase().includes(s) || p.supplierName.toLowerCase().includes(s));
  }, [products, search]);

  const startEdit = (p: any) => { setEditId(p.id); setEditForm({ ...p }); };
  const cancelEdit = () => { setEditId(null); setEditForm({}); };
  const saveEdit = () => {
    editForm.totalCost = editForm.quantity * editForm.unitCost;
    updateAvailableProduct(editForm);
    setProducts(getAvailableProducts());
    setEditId(null);
    toast.success("Producto actualizado");
  };

  const confirmDelete = () => {
    if (deleteId) { deleteAvailableProduct(deleteId); setProducts(getAvailableProducts()); toast.success("Producto eliminado"); }
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
      <h1 className="text-2xl font-bold text-foreground">Productos Disponibles</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9 bg-muted border-border text-foreground h-9 text-sm" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Datos del producto (Nombre|Marca|Rubro|Talle)", "Cantidad", "Gasto unitario", "Gasto total", "Proveedor", "Fecha compra", "N° envío", "Acciones"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />No hay productos disponibles
                </td></tr>
              ) : filtered.map(p => editId === p.id ? (
                <tr key={p.id} className="border-b border-border/50 bg-muted/20">
                  <td className="px-4 py-2 space-y-1 min-w-[320px]">
                    <Input
                      placeholder="Nombre"
                      value={editForm.name || ""}
                      onChange={e => setEditForm((f:any) => ({ ...f, name: e.target.value }))}
                      className={ic}
                    />

                    <Input
                      placeholder="Marca"
                      value={editForm.brand || ""}
                      onChange={e => setEditForm((f:any) => ({ ...f, brand: e.target.value }))}
                      className={ic}
                    />

                    <Input
                      placeholder="Categoría"
                      value={editForm.category || ""}
                      onChange={e => setEditForm((f:any) => ({ ...f, category: e.target.value }))}
                      className={ic}
                    />

                    <Input
                      placeholder="Tamaño"
                      value={editForm.size || ""}
                      onChange={e => setEditForm((f:any) => ({ ...f, size: e.target.value }))}
                      className={ic}
                    />
                  </td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.quantity} onChange={e => setEditForm((f: any) => ({ ...f, quantity: +e.target.value }))} className={`${ic} w-20`} /></td>
                  <td className="px-4 py-2"><Input type="number" value={editForm.unitCost} onChange={e => setEditForm((f: any) => ({ ...f, unitCost: +e.target.value }))} className={`${ic} w-24`} /></td>
                  <td className="px-4 py-2 text-foreground">${(editForm.quantity * editForm.unitCost).toLocaleString()}</td>
                  <td className="px-4 py-2"><Input value={editForm.supplierName} onChange={e => setEditForm((f: any) => ({ ...f, supplierName: e.target.value }))} className={ic} /></td>
                  <td className="px-4 py-2"><Input type="date" value={editForm.purchaseDate} onChange={e => setEditForm((f: any) => ({ ...f, purchaseDate: e.target.value }))} className={ic} /></td>
                  <td className="px-4 py-2"><Input value={editForm.trackingNumber} onChange={e => setEditForm((f: any) => ({ ...f, trackingNumber: e.target.value }))} className={ic} /></td>
                  <td className="px-4 py-2"><div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={saveEdit} className="h-7 w-7 text-success"><Save className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-7 w-7 text-muted-foreground"><X className="h-3 w-3" /></Button>
                  </div></td>
                </tr>
              ) : (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-foreground">{buildProductData(p)}</td>
                  <td className="px-4 py-3 text-foreground">{p.quantity}</td>
                  <td className="px-4 py-3 text-foreground">${p.unitCost}</td>
                  <td className="px-4 py-3 text-foreground">${p.totalCost}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.supplierName || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.purchaseDate)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.trackingNumber || "—"}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(p)} className="h-7 w-7 text-muted-foreground hover:text-foreground"><Edit className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(p.id)} className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></Button>
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
            <AlertDialogTitle className="text-foreground">¿Eliminar este producto?</AlertDialogTitle>
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
