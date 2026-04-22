import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Trash2, Edit, Package, Save, X, Loader2, Monitor } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DemoAvailableProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

useEffect(() => {
  const timer = setTimeout(() => {
    try {
      // Solo leemos lo que haya; si no hay nada, 'saved' será un array vacío []
      const saved = JSON.parse(sessionStorage.getItem("demo_available_products") || "[]");
      setProducts(saved);
    } catch (e) {
      setProducts([]);
    }
    setLoading(false);
  }, 800);
  return () => clearTimeout(timer);
}, []);


  const buildProductDisplay = (p: any) => 
    `${p.name || ''} ${p.brand ? `(${p.brand})` : ''} - ${p.category || 'Sin Cat.'}`;

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(p => 
      buildProductDisplay(p).toLowerCase().includes(s) || 
      (p.supplierName && p.supplierName.toLowerCase().includes(s))
    );
  }, [products, search]);

  const startEdit = (p: any) => { setEditId(p.id); setEditForm({ ...p }); };
  
  const saveEdit = () => {
    const updated = products.map(p => {
      if (p.id === editId) {
        // Aseguramos que stock y quantity se sincronicen en la edición
        return { ...editForm, stock: editForm.quantity };
      }
      return p;
    });
    setProducts(updated);
    sessionStorage.setItem("demo_available_products", JSON.stringify(updated));
    toast.success("Producto actualizado");
    setEditId(null);
  };

  const confirmDelete = () => {
    const updated = products.filter(p => p.id !== deleteId);
    setProducts(updated);
    sessionStorage.setItem("demo_available_products", JSON.stringify(updated));
    toast.success("Producto eliminado");
    setDeleteId(null);
  };

  const ic = "bg-muted border-border text-foreground h-8 text-sm w-full";

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Sincronizando inventario...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Stock de Productos</h1>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
          {products.length} Referencias
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Buscar producto, marca o proveedor..." 
          className="pl-9 h-10" 
        />
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Producto / Categoría</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Stock</th>
                <th className="text-left px-4 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Costo Unit.</th>
                <th className="text-left px-4 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Inversión Total</th>
                <th className="text-left px-4 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Proveedor</th>
                <th className="text-right px-4 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-muted-foreground italic">
                    <Package className="mx-auto mb-2 h-10 w-10 opacity-10" />
                    No hay productos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : filtered.map(p => {
                const isEditing = editId === p.id;
                const stock = Number(isEditing ? editForm.quantity : (p.stock ?? p.quantity)) || 0;
                const unitCost = Number(isEditing ? editForm.unitCost : p.unitCost) || 0;
                const totalCost = stock * unitCost;

                return (
                  <tr key={p.id} className={`hover:bg-muted/20 transition-colors ${isEditing ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-4">
                      {isEditing ? (
                        <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className={ic} />
                      ) : (
                        <>
                          <div className="font-bold text-foreground">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground">{p.brand} • {p.category} • Talle/Medida: {p.size || '-'}</div>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {isEditing ? (
                        <Input type="number" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: +e.target.value})} className="h-8 w-16 mx-auto text-center" />
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {stock} un.
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                      {isEditing ? (
                        <Input type="number" value={editForm.unitCost} onChange={e => setEditForm({...editForm, unitCost: +e.target.value})} className="h-8 w-24" />
                      ) : (
                        `$${unitCost.toLocaleString()}`
                      )}
                    </td>
                    <td className="px-4 py-4 font-bold text-foreground">
                      ${totalCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {isEditing ? (
                        <Input value={editForm.supplierName} onChange={e => setEditForm({...editForm, supplierName: e.target.value})} className={ic} />
                      ) : (
                        p.supplierName || "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8 text-green-500"><Save className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditId(null)} className="h-8 w-8 text-muted-foreground"><X className="h-4 w-4" /></Button>
                          </>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => startEdit(p)} className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeleteId(p.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
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
