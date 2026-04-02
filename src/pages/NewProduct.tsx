import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveAvailableProduct, generateId } from "@/lib/store";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const [showConfirm, setShowConfirm] = useState(false);
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

  const confirmSave = () => {
    saveAvailableProduct({
      id: generateId(), ...form, totalCost, createdAt: new Date().toISOString(),
    });
    toast.success("Producto agregado correctamente");
    setForm({ name: "", brand: "", category: "", size: "", quantity: 1, unitCost: 0, supplierName: "", purchaseDate: "", trackingNumber: "", description: "", observations: "" });
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Producto</h1>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Ingreso de producto</h2>

        <div className="glass-card p-4 space-y-3 bg-primary/5 border-primary/20">
          <h3 className="text-xs font-semibold text-foreground uppercase">Datos del producto</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nombre"><Input value={form.name} onChange={e => set("name", e.target.value)} className={ic} /></Field>
            <Field label="Marca"><Input value={form.brand} onChange={e => set("brand", e.target.value)} className={ic} /></Field>
            <Field label="Rubro"><Input value={form.category} onChange={e => set("category", e.target.value)} placeholder="ej: perfume, indumentaria, tecnología" className={ic} /></Field>
            <Field label="Talle"><Input value={form.size} onChange={e => set("size", e.target.value)} className={ic} /></Field>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Cantidad"><Input type="number" value={form.quantity} onChange={e => set("quantity", +e.target.value)} className={ic} /></Field>
          <Field label="Gasto unitario ($)"><Input type="number" value={form.unitCost} onChange={e => set("unitCost", +e.target.value)} className={ic} /></Field>
        </div>

        <div className="glass-card p-3 bg-primary/5 border-primary/20">
          <p className="text-xs text-muted-foreground">Gasto total</p>
          <p className="text-xl font-bold text-foreground">${totalCost.toLocaleString()}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nombre y apellido proveedor"><Input value={form.supplierName} onChange={e => set("supplierName", e.target.value)} className={ic} /></Field>
          <Field label="Fecha compra"><Input type="date" value={form.purchaseDate} onChange={e => set("purchaseDate", e.target.value)} className={ic} /></Field>
          <Field label="Número de envío"><Input value={form.trackingNumber} onChange={e => set("trackingNumber", e.target.value)} className={ic} /></Field>
        </div>

        <Field label="Descripción"><Textarea value={form.description} onChange={e => set("description", e.target.value)} className={`${ic} min-h-[60px]`} /></Field>
        <Field label="Observaciones"><Textarea value={form.observations} onChange={e => set("observations", e.target.value)} className={`${ic} min-h-[60px]`} /></Field>
      </div>

      <div className="flex gap-3">
        <Button onClick={doSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" /> Guardar producto
        </Button>
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Agregar este nuevo producto?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">Se guardará en Productos disponibles.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">No</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} className="bg-primary text-primary-foreground hover:bg-primary/90">Sí</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
