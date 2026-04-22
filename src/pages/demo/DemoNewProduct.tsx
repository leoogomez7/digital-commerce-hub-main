import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2, Package } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Componente de campo reutilizado para mantener el diseño
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-foreground text-xs font-medium">{label}</Label>
    {children}
  </div>
);

const ic = "bg-muted border-border text-foreground placeholder:text-muted-foreground h-9 text-sm";

export default function DemoNewProduct() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    size: "",
    quantity: 1,
    unitCost: 0,
    supplierName: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    observations: "",
  });

  const totalCost = form.quantity * form.unitCost;
  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const doSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Completa el nombre del producto");
      return;
    }
    setShowConfirm(true);
  };

  // LÓGICA DE GUARDADO VOLÁTIL (sessionStorage)
  const confirmSave = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      // 1. Obtener lista actual de la demo o iniciar vacía
      const existing = JSON.parse(sessionStorage.getItem("demo_available_products") || "[]");
      
      // 2. Crear el nuevo objeto con el mismo formato que la tabla espera
      const newItem = {
        ...form,
        id: Date.now().toString(),
        stock: form.quantity, // Sincronizamos stock inicial con cantidad
        totalCost,
        createdAt: new Date().toISOString()
      };

      // 3. Guardar en el navegador
      sessionStorage.setItem("demo_available_products", JSON.stringify([newItem, ...existing]));

      toast.success("Producto guardado con éxito (Modo Demo)");
      setIsSaving(false);
      setShowConfirm(false);
      navigate("/demo/available-products");
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl p-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Producto (Demo)</h1>
      </div>

      <form onSubmit={doSave} className="space-y-6">
        <div className="glass-card p-5 space-y-4 border border-border/50">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Detalles del Inventario</h2>
          
          <div className="glass-card p-4 space-y-3 bg-primary/5 border-primary/20">
            <h3 className="text-xs font-semibold text-foreground uppercase flex items-center gap-2">
              <Package className="h-3 w-3" /> Datos del producto
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Nombre del Producto">
                <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ej: Remera Algodón" className={ic} />
              </Field>
              <Field label="Marca">
                <Input value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="Ej: Urban" className={ic} />
              </Field>
              <Field label="Rubro/Categoría">
                <Input value={form.category} onChange={e => set("category", e.target.value)} placeholder="Ej: Indumentaria" className={ic} />
              </Field>
              <Field label="Talle / Medida">
                <Input value={form.size} onChange={e => set("size", e.target.value)} placeholder="Ej: L, XL, 42" className={ic} />
              </Field>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Cantidad en Stock">
              <Input type="number" value={form.quantity} onChange={e => set("quantity", +e.target.value)} className={ic} />
            </Field>
            <Field label="Costo Unitario ($)">
              <Input type="number" value={form.unitCost} onChange={e => set("unitCost", +e.target.value)} className={ic} />
            </Field>
          </div>

          <div className="glass-card p-3 bg-primary/5 border-primary/20">
            <p className="text-xs text-muted-foreground">Inversión total calculada</p>
            <p className="text-xl font-bold text-foreground">${totalCost.toLocaleString()}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Proveedor">
              <Input value={form.supplierName} onChange={e => set("supplierName", e.target.value)} placeholder="Nombre del proveedor" className={ic} />
            </Field>
            <Field label="Fecha de Compra">
              <Input type="date" value={form.purchaseDate} onChange={e => set("purchaseDate", e.target.value)} className={ic} />
            </Field>
          </div>

          <Field label="Observaciones Adicionales">
            <Textarea value={form.observations} onChange={e => set("observations", e.target.value)} className={`${ic} min-h-[80px] pt-2`} />
          </Field>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Producto Demo
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            Cancelar
          </Button>
        </div>
      </form>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar ingreso de producto?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción simulará la carga en el inventario de la sesión actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} className="bg-primary">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
