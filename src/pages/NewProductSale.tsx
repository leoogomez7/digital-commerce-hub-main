import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
// --- NUBE ---
import { client } from "@/lib/db"; 
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { generateId } from "@/lib/store";
// ------------
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const salesChannels = ["WhatsApp", "Instagram", "Facebook", "Presencial", "Otro"];

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-foreground text-xs font-medium">{label}</Label>
    {children}
  </div>
);
const ic = "bg-muted border-border text-foreground h-9 text-sm";

export default function NewProductSale() {
  const navigate = useNavigate();
  const { user } = useKindeAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const [form, setForm] = useState({
    clientName: "", salesChannel: "", quantity: 1, externalCosts: 0, salePrice: 0, saleDate: new Date().toISOString().split('T')[0]
  });

  const selectedProduct = products.find(p => p.id === selectedId);
  const totalCost = form.quantity * (selectedProduct?.unitCost || 0);
  const profit = form.salePrice - totalCost - form.externalCosts;

  useEffect(() => {
    async function load() {
      const res = await client.execute({
        sql: "SELECT * FROM available_products WHERE user_id = ? AND quantity > 0",
        args: [user?.id || ""]
      });
      setProducts(res.rows);
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  const confirmSave = async () => {
    setSaving(true);
    try {
      const productData = `${selectedProduct.name} (${selectedProduct.brand})`;
      await client.batch([
        {
          sql: `INSERT INTO product_sales (id, clientName, productId, productData, quantity, salePrice, profit, totalCost, externalCosts, user_id, createdAt, saleDate, salesChannel) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [generateId(), form.clientName, selectedId, productData, form.quantity, form.salePrice, profit, totalCost, form.externalCosts, user?.id, new Date().toISOString(), form.saleDate, form.salesChannel]
        },
        {
          sql: "UPDATE available_products SET quantity = quantity - ? WHERE id = ?",
          args: [form.quantity, selectedId]
        }
      ], "write");
      toast.success("Venta registrada con éxito");
      navigate("/dashboard/product-sales");
    } catch (e) {
      toast.error("Error al procesar la venta");
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-3xl p-4">
      <h1 className="text-2xl font-bold text-foreground">Nueva Venta de Producto</h1>
      <div className="glass-card p-5 space-y-4">
        <Field label="Cliente"><Input value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} className={ic} /></Field>
        <Field label="Producto">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className={ic}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.brand} (Stock: {p.quantity})</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cantidad"><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: +e.target.value})} className={ic} /></Field>
          <Field label="Precio Venta ($)"><Input type="number" value={form.salePrice} onChange={e => setForm({...form, salePrice: +e.target.value})} className={ic} /></Field>
        </div>
        <div className={`p-4 rounded-lg font-bold ${profit >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          Ganancia Estimada: ${profit.toLocaleString()}
        </div>
        <Button onClick={() => setShowConfirm(true)} disabled={saving || !selectedId} className="w-full">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Registrar Venta
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar Venta?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</Button>
            <Button onClick={confirmSave} disabled={saving}>Confirmar</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
