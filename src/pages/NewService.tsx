import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
// --- IMPORTACIONES CLAVE PARA LA NUBE ---
import { client } from "@/lib/db"; 
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { generateId } from "@/lib/store"; 
// ---------------------------------------
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

export default function NewService() {
  const navigate = useNavigate();
  const { user } = useKindeAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    type: "", months: 1, email: "", password: "", accessCodes: "",
    quantity: 1, unitCost: 0, supplierName: "", purchaseDate: "",
    description: "", observations: "",
  });

  const totalCost = form.quantity * form.unitCost;
  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const doSave = () => {
    if (!form.type) { 
      toast.error("Completa el tipo de servicio"); 
      return; 
    }
    setShowConfirm(true);
  };

  // FUNCIÓN PARA GUARDAR EN TURSO (SQLITE NUBE)
  const confirmSave = async () => {
    if (!user?.id) {
      toast.error("Error de autenticación");
      return;
    }

    setIsSaving(true);
    try {
      await client.execute({
        sql: `INSERT INTO available_services (
          id, name, months, email, password, accessCodes, 
          quantity, unitCost, totalCost, supplierName, 
          purchaseDate, description, observations, user_id, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          generateId(), 
          form.type, 
          form.months, 
          form.email, 
          form.password, 
          form.accessCodes, 
          form.quantity, 
          form.unitCost, 
          totalCost, 
          form.supplierName, 
          form.purchaseDate, 
          form.description, 
          form.observations, 
          user.id, 
          new Date().toISOString()
        ]
      });

      toast.success("Servicio digital guardado en la nube");
      
      // Limpiar formulario tras éxito
      setForm({ 
        type: "", months: 1, email: "", password: "", accessCodes: "", 
        quantity: 1, unitCost: 0, supplierName: "", purchaseDate: "", 
        description: "", observations: "" 
      });
      
    } catch (error) {
      console.error("Error en Turso:", error);
      toast.error("Error al guardar en la base de datos");
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
        <h1 className="text-2xl font-bold text-foreground">Nuevo Servicio Digital</h1>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Ingreso de servicio digital</h2>

        <div className="glass-card p-4 space-y-3 bg-primary/5 border-primary/20">
          <h3 className="text-xs font-semibold text-foreground uppercase">Datos del servicio</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Tipo/Nombre"><Input value={form.type} onChange={e => set("type", e.target.value)} placeholder="ej: Netflix, PS Plus" className={ic} /></Field>
            <Field label="Meses"><Input type="number" value={form.months} onChange={e => set("months", +e.target.value)} className={ic} /></Field>
            <Field label="Correo"><Input value={form.email} onChange={e => set("email", e.target.value)} className={ic} /></Field>
            <Field label="Contraseña"><Input value={form.password} onChange={e => set("password", e.target.value)} className={ic} /></Field>
            <Field label="Códigos de acceso"><Input value={form.accessCodes} onChange={e => set("accessCodes", e.target.value)} className={ic} /></Field>
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
        </div>

        <Field label="Descripción"><Textarea value={form.description} onChange={e => set("description", e.target.value)} className={`${ic} min-h-[60px]`} /></Field>
        <Field label="Observaciones"><Textarea value={form.observations} onChange={e => set("observations", e.target.value)} className={`${ic} min-h-[60px]`} /></Field>
      </div>

      <div className="flex gap-3">
        <Button onClick={doSave} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar servicio digital
        </Button>
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Agregar este nuevo servicio?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">Se guardará de forma permanente en Turso.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">No</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); confirmSave(); }} 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sí, guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
