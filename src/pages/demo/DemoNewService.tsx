import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-foreground text-xs font-medium">{label}</Label>
    {children}
  </div>
);

const ic = "bg-muted border-border text-foreground placeholder:text-muted-foreground h-9 text-sm";

export default function DemoNewService() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPass, setShowPass] = useState(false); // Para mostrar/ocultar pass

  const [form, setForm] = useState({
    type: "", 
    months: "", 
    email: "", 
    password: "", 
    accessCode: "", 
    quantity: 0, 
    unitCost: 0, 
    supplierName: "", 
    purchaseDate: new Date().toISOString().split('T')[0], // Campo de fecha agregado
    description: "", 
    observations: "", 
  });

  const set = (key: keyof typeof form, value: string | number) => 
    setForm(f => ({ ...f, [key]: value }));

  const confirmSave = () => {
    if (isSaving) return;
    setIsSaving(true);
    
    setTimeout(() => {
      try {
        const existing = JSON.parse(sessionStorage.getItem("demo_available_services") || "[]");
        const newItem = { 
          ...form, 
          id: Date.now().toString(), 
          name: form.type,
          stock: form.quantity,
          createdAt: new Date().toISOString() 
        };
        
        sessionStorage.setItem("demo_available_services", JSON.stringify([newItem, ...existing]));
        toast.success("Servicio guardado exitosamente");
        navigate("/demo/available-services");
      } catch (error) {
        toast.error("Error al guardar en el storage");
      } finally {
        setIsSaving(false);
        setShowConfirm(false);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl p-4 mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Servicio (Demo)</h1>
      </div>

      <div className="glass-card p-6 space-y-4 border rounded-xl shadow-sm bg-card text-card-foreground">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tipo/Nombre">
            <Input value={form.type} onChange={e => set("type", e.target.value)} placeholder="ej: Netflix" className={ic} />
          </Field>
          <Field label="Fecha de Compra">
            <Input type="date" value={form.purchaseDate} onChange={e => set("purchaseDate", e.target.value)} className={ic} />
          </Field>
          <Field label="Proveedor (Nombre y Apellido)">
            <Input value={form.supplierName} onChange={e => set("supplierName", e.target.value)} placeholder="Ej: Juan Proveedor" className={ic} />
          </Field>
          
          {/* Fila de Credenciales */}
          <Field label="Correo Electrónico">
            <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="admin@cuenta.com" className={ic} />
          </Field>
          <Field label="Contraseña">
            <div className="relative">
              <Input 
                type={showPass ? "text" : "password"} 
                value={form.password} 
                onChange={e => set("password", e.target.value)} 
                className={`${ic} pr-10`} 
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Field label="Código de Acceso / PIN">
            <Input value={form.accessCode} onChange={e => set("accessCode", e.target.value)} placeholder="Ej: PIN 1234" className={ic} />
          </Field>
          <Field label="Meses del servicio digital">
            <Input type="number" value={form.months} onChange={e => set("months", +e.target.value)} className={ic} />
          </Field>
          <Field label="Cantidad">
            <Input type="number" value={form.quantity} onChange={e => set("quantity", +e.target.value)} className={ic} />
          </Field>
          <Field label="Costo Unitario ($)">
            <Input type="number" value={form.unitCost} onChange={e => set("unitCost", +e.target.value)} className={ic} />
          </Field>
          
          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
            <Field label="Descripción">
              <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Detalles del plan..." className="bg-muted min-h-[80px]" />
            </Field>
            <Field label="Observaciones Internas">
              <Textarea value={form.observations} onChange={e => set("observations", e.target.value)} placeholder="Notas privadas..." className="bg-muted min-h-[80px]" />
            </Field>
          </div>
        </div>

        <div className="pt-2 border-t mt-4">
          <div className="flex justify-between items-center mb-4 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">Inversión Estimada:</span>
            <span className="text-xl font-bold text-primary">
              ${(form.quantity * form.unitCost).toLocaleString()}
            </span>
          </div>
          
          <Button 
            onClick={() => setShowConfirm(true)} 
            disabled={!form.type || !form.email || !form.password || isSaving} 
            className="w-full h-11"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} 
            Registrar e Ingresar al Inventario
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar ingreso de mercadería?</AlertDialogTitle>
            <div className="text-sm text-muted-foreground">
              Se cargarán {form.quantity} unidades de {form.type} con fecha {form.purchaseDate}.
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmSave(); }} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
