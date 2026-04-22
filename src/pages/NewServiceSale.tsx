import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2, MonitorSmartphone } from "lucide-react";
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

export default function NewServiceSale() {
  const navigate = useNavigate();
  const { user } = useKindeAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const [form, setForm] = useState({
    clientName: "", 
    salesChannel: "", 
    quantity: 1, 
    externalCosts: 0, 
    unitPrice: 0, // Precio Unitario
    saleDate: new Date().toISOString().split('T')[0]
  });

  // CARGAR SERVICIOS DESDE TURSO
  useEffect(() => {
    async function load() {
      try {
        const res = await client.execute({
          sql: "SELECT * FROM available_services WHERE user_id = ? AND quantity > 0",
          args: [user?.id || ""]
        });
        setServices(res.rows);
      } catch (e) {
        console.error("Error cargando inventario:", e);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  const selectedService = services.find(s => s.id === selectedId || s.id?.toString() === selectedId);
  
  // Cálculos Automáticos
  const totalCost = form.quantity * (Number(selectedService?.unitCost) || 0);
  const totalSalePrice = form.quantity * form.unitPrice; // Multiplicación: Unitario * Cantidad
  const profit = totalSalePrice - totalCost - form.externalCosts;

  const confirmSave = async () => {
    if (form.quantity > (selectedService?.quantity || 0)) {
      toast.error("No hay suficiente stock disponible");
      setShowConfirm(false);
      return;
    }

    setSaving(true);
    try {
      const serviceData = `${selectedService.name} (${selectedService.months} meses)`;
      
      await client.batch([
        {
          sql: `INSERT INTO service_sales (id, clientName, serviceId, serviceData, quantity, salePrice, profit, totalCost, externalCosts, user_id, createdAt, saleDate, salesChannel, customerEmail) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            generateId(), 
            form.clientName, 
            selectedId, 
            serviceData, 
            form.quantity, 
            totalSalePrice, 
            profit, 
            totalCost, 
            form.externalCosts, 
            user?.id, 
            new Date().toISOString(), 
            form.saleDate, 
            form.salesChannel,
            selectedService.email
          ]
        },
        {
          sql: "UPDATE available_services SET quantity  = quantity  - ? WHERE id = ?",
          args: [form.quantity, selectedId]
        }
      ], "write");

      toast.success("Venta digital registrada con éxito");
      navigate("/dashboard/service-sales");
    } catch (e) {
      console.error(e);
      toast.error("Error al procesar la venta en la nube");
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-3xl p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Nueva Venta Digital</h1>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4 border border-border/50 shadow-sm rounded-xl">
        <div className="flex items-center gap-2 text-primary mb-2">
          <MonitorSmartphone className="h-5 w-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Venta de servicio digital</h2>
        </div>

        <Field label="Nombre y apellido del Cliente">
          <Input 
            value={form.clientName} 
            onChange={e => setForm({...form, clientName: e.target.value})} 
            className={ic} 
          />
        </Field>

                <Field label="Correo electronico del cliente">
          <Input 
            value={form.clientName} 
            onChange={e => setForm({...form, clientName: e.target.value})} 
            className={ic} 
          />
        </Field>

          <Field label="Celular del Cliente">
          <Input 
            value={form.clientName} 
            onChange={e => setForm({...form, clientName: e.target.value})} 
            className={ic} 
          />
        </Field>

                  <Field label="Red social del Cliente">
          <Input 
            value={form.clientName} 
            onChange={e => setForm({...form, clientName: e.target.value})} 
            className={ic} 
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Canal de Venta">
            <Select value={form.salesChannel} onValueChange={val => setForm({...form, salesChannel: val})}>
              <SelectTrigger className={ic}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {salesChannels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Fecha de Venta">
            <Input type="date" value={form.saleDate} onChange={e => setForm({...form, saleDate: e.target.value})} className={ic} />
          </Field>
        </div>

        <Field label="Seleccionar servicio digital en Stock">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className={ic}>
              <SelectValue placeholder={services.length > 0 ? "Elige un servicio digital" : "No hay stock disponible"} />
            </SelectTrigger>
            <SelectContent>
              {services.map(s => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name} - {s.months} meses - {s.email} - contraseña: {s.password} - code: {s.accessCodes} - ({s.quantity} disponibles)
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
              value={form.unitPrice || ""} 
              onChange={e => setForm({...form, unitPrice: Math.max(0, +e.target.value)})} 
              className={ic} 
            />
          </Field>
        </div>

        {selectedId && (
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Venta Final ({form.quantity} x ${form.unitPrice}):</span>
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
          disabled={saving || !selectedId || !form.clientName || form.quantity > (selectedService?.quantity || 0)} 
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold"
        >
          {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} 
          Registrar Venta Digital
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar venta digital?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} className="bg-primary">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
