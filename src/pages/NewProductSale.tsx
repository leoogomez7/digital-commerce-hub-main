import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2, ShoppingBag} from "lucide-react";
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
  const totalSalePrice = form.quantity * form.salePrice; // Cálculo automático
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
    <div className="space-y-6 max-w-3xl p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Nueva Venta de Producto</h1>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4 border border-border/50 shadow-sm rounded-xl">
        <div className="flex items-center gap-2 text-primary mb-2">
          <ShoppingBag className="h-5 w-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Venta de producto</h2>
        </div>

        <Field label="Nombre del Cliente">
          <Input 
            value={form.clientName} 
            onChange={e => setForm({...form, clientName: e.target.value})} 
            className={ic} 
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Canal de Venta">
            <Select value={form.salesChannel} onValueChange={val => setForm({...form, salesChannel: val})}>
              <SelectTrigger className={ic}><SelectValue /></SelectTrigger>
              <SelectContent>
                {salesChannels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Fecha de Venta">
            <Input type="date" value={form.saleDate} onChange={e => setForm({...form, saleDate: e.target.value})} className={ic} />
          </Field>
        </div>

        <Field label="Seleccionar Producto en Stock">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className={ic}>
              <SelectValue placeholder={products.length > 0 ? "Elige un producto" : "No hay stock disponible"} />
            </SelectTrigger>
            <SelectContent>
              {products.map(p => (
                <SelectItem key={p.id} value={p.id} disabled={(p.stock ?? p.quantity) <= 0}>
                  {p.name} - {p.brand} - {p.category} - talle/medida: {p.size} - ({(p.stock ?? p.quantity)} disponibles)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Cantidad">
            <Input 
              type="number" 
              value={form.quantity} 
              onChange={e => setForm({...form, quantity: Math.max(1, +e.target.value)})} 
              className={ic} 
            />
          </Field>
          <Field label="Precio Unitario ($)">
            <Input 
              type="number" 
              value={form.salePrice || ""} 
              onChange={e => setForm({...form, salePrice: Math.max(0, +e.target.value)})} 
              className={ic} 
            />
          </Field>
        </div>

        {selectedId && (
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Venta Final ({form.quantity} x ${form.salePrice}):</span>
              <span>${totalSalePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-primary/10 pt-2">
              <span className="text-foreground">Ganancia Estimada:</span>
              <span className={profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                ${profit.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <Button 
          onClick={() => setShowConfirm(true)} 
          disabled={saving || !selectedId || !form.clientName || form.quantity > (selectedProduct?.stock ?? selectedProduct?.quantity)} 
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white"
        >
          {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} 
          Registrar Venta
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar venta?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
