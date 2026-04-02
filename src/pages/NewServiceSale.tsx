import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAvailableServices, saveServiceSale, reduceServiceQuantity, generateId, buildServiceData } from "@/lib/store";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const salesChannels = ["Presencial", "WhatsApp", "Llamada", "Correo electrónico", "Instagram", "Facebook", "Otro"];

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label className="text-foreground text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
  const ic = "bg-muted border-border text-foreground placeholder:text-muted-foreground h-9 text-sm";

export default function NewServiceSale() {
  const navigate = useNavigate();
  const availableServices = getAvailableServices().filter(s => s.quantity > 0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const selectedService = availableServices.find(s => s.id === selectedServiceId);

  const [form, setForm] = useState({
    clientName: "", phone: "", instagram: "", facebook: "", clientEmail: "",
    salesChannel: "", saleDate: "", quantity: 1, externalCosts: 0, salePrice: 0,
    description: "", observations: "",
  });

  const unitCost = selectedService?.unitCost || 0;
  const totalCost = form.quantity * unitCost;
  const profit = form.salePrice - totalCost - form.externalCosts;
  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const doSave = () => {
    if (!form.clientName || !selectedServiceId) { toast.error("Completa cliente y servicio"); return; }
    if (selectedService && form.quantity > selectedService.quantity) { toast.error("Stock insuficiente"); return; }
    setShowConfirm(true);
  };

  const confirmSave = () => {
    saveServiceSale({
      id: generateId(), ...form, serviceId: selectedServiceId,
      serviceData: selectedService ? buildServiceData(selectedService) : "",
      unitCost, totalCost, profit, createdAt: new Date().toISOString(),
    });
    reduceServiceQuantity(selectedServiceId, form.quantity);
    toast.success("Venta registrada correctamente");
    setForm({ clientName: "", phone: "", instagram: "", facebook: "", clientEmail: "", salesChannel: "", saleDate: "", quantity: 1, externalCosts: 0, salePrice: 0, description: "", observations: "" });
    setSelectedServiceId("");
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Nueva Venta de Servicio Digital</h1>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Datos clientes</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nombre y apellido cliente"><Input value={form.clientName} onChange={e => set("clientName", e.target.value)} className={ic} /></Field>
          <Field label="Número de celular"><Input value={form.phone} onChange={e => set("phone", e.target.value)} className={ic} /></Field>
          <Field label="Instagram"><Input value={form.instagram} onChange={e => set("instagram", e.target.value)} className={ic} /></Field>
          <Field label="Facebook"><Input value={form.facebook} onChange={e => set("facebook", e.target.value)} className={ic} /></Field>
          <Field label="Correo electrónico"><Input value={form.clientEmail} onChange={e => set("clientEmail", e.target.value)} className={ic} /></Field>
          <Field label="Red social de venta">
            <Select value={form.salesChannel} onValueChange={v => set("salesChannel", v)}>
              <SelectTrigger className={ic}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {salesChannels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Servicio digital disponible">
          <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
            <SelectTrigger className={ic}><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              {availableServices.map(s => (
                <SelectItem key={s.id} value={s.id}>{buildServiceData(s)} (Stock: {s.quantity})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Fecha de venta"><Input type="date" value={form.saleDate} onChange={e => set("saleDate", e.target.value)} className={ic} /></Field>
          <Field label="Cantidad"><Input type="number" value={form.quantity} onChange={e => set("quantity", +e.target.value)} min={1} max={selectedService?.quantity || 999} className={ic} /></Field>
          <Field label="Gasto unitario ($)"><Input type="number" value={unitCost} readOnly className={`${ic} opacity-60`} /></Field>
          <Field label="Gasto total ($)"><Input type="number" value={totalCost} readOnly className={`${ic} opacity-60`} /></Field>
          <Field label="Gastos externos ($)"><Input type="number" value={form.externalCosts} onChange={e => set("externalCosts", +e.target.value)} placeholder="ej: impuesto tarjeta" className={ic} /></Field>
          <Field label="Precio de venta ($)"><Input type="number" value={form.salePrice} onChange={e => set("salePrice", +e.target.value)} className={ic} /></Field>
        </div>

        <div className="glass-card p-3 bg-primary/5 border-primary/20">
          <p className="text-xs text-muted-foreground">Ganancia automática</p>
          <p className={`text-xl font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>${profit.toLocaleString()}</p>
        </div>

        <Field label="Descripción"><Textarea value={form.description} onChange={e => set("description", e.target.value)} className={`${ic} min-h-[60px]`} /></Field>
        <Field label="Observaciones"><Textarea value={form.observations} onChange={e => set("observations", e.target.value)} className={`${ic} min-h-[60px]`} /></Field>
      </div>

      <div className="flex gap-3">
        <Button onClick={doSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" /> Registrar venta
        </Button>
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Agregar esta nueva venta?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">Se registrará en Servicios digitales vendidos.</AlertDialogDescription>
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
