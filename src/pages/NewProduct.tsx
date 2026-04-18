import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-foreground text-xs font-medium">{label}</Label>
    {children}
  </div>
);
const ic = "bg-muted border-border text-foreground placeholder:text-muted-foreground h-9 text-sm";

export default function NewProduct() {
  const navigate = useNavigate();
  const { user } = useKindeAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", brand: "", category: "", size: "",
    quantity: 1, unitCost: 0, supplierName: "", purchaseDate: "",
    trackingNumber: "", description: "", observations: "",
  });

  const totalCost = form.quantity * form.unitCost;
  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const doSave = () => {
    if (!form.name) { toast.error("Completa el nombre del producto"); return; }
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    try {
      await client.execute({
        sql: `INSERT INTO available_products (
          id, name, brand, category, size, quantity, unitCost, 
          totalCost, supplierName, purchaseDate, trackingNumber, 
          description, observations, user_id, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          generateId(), form.name, form.brand, form.category, form.size,
          form.quantity, form.unitCost, totalCost, form.supplierName,
          form.purchaseDate, form.trackingNumber, form.description,
          form.observations, user?.id, new Date().toISOString()
        ]
      });

      toast.success("Producto guardado en la nube");
      setForm({ name: "", brand: "", category: "", size: "", quantity: 1, unitCost: 0, supplierName: "", purchaseDate: "", trackingNumber: "", description: "", observations: "" });
    } catch (error) {
      toast.error("Error al conectar con la base de datos");
    } finally {
      setIsSaving(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl p-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Producto</h1>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Ingreso de producto</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nombre"><Input value={form.name} onChange={e => set("name", e.target.value)} className={ic} /></Field>
          <Field label="Marca"><Input value={form.brand} onChange={e => set("brand", e.target.value)} className={ic} /></Field>
          <Field label="Rubro"><Input value={form.category} onChange={e => set("category", e.target.value)} className={ic} /></Field>
          <Field label="Talle"><Input value={form.size} onChange={e => set("size", e.target.value)} className={ic} /></Field>
          <Field label="Cantidad"><Input type="number" value={form.quantity} onChange={e => set("quantity", +e.target.value)} className={ic} /></Field>
          <Field label="Costo Unitario ($)"><Input type="number" value={form.unitCost} onChange={e => set("unitCost", +e.target.value)} className={ic} /></Field>
        </div>
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground">Inversión total: <span className="text-lg font-bold text-foreground">${totalCost.toLocaleString()}</span></p>
        </div>
        <Field label="Descripción"><Textarea value={form.description} onChange={e => set("description", e.target.value)} className={ic} /></Field>
      </div>

      <div className="flex gap-3">
        <Button onClick={doSave} disabled={isSaving} className="bg-primary text-primary-foreground">
          {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Producto
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar ingreso?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmSave(); }}>Sí, guardar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
