import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Service {
  id: string;
  name: string;
  stock: number;
  email: string;
  unitCost: number;
  months: number;
}

export default function DemoNewServiceSale() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const [form, setForm] = useState({
    clientName: "", 
    salesChannel: "WhatsApp", 
    quantity: 1, 
    externalCosts: 0, 
    unitPrice: 0, // Cambiado de salePrice a unitPrice
    saleDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const inventory = JSON.parse(sessionStorage.getItem("demo_available_services") || "[]");
    setServices(inventory.filter((s: Service) => s.stock > 0));
    setLoading(false);
  }, []);

  const selectedService = services.find(s => s.id === selectedId);
  
  // Cálculos automáticos solicitados
  const totalCost = form.quantity * (selectedService?.unitCost || 0);
  const totalSalePrice = form.quantity * form.unitPrice; // Multiplicación: Unitario * Cantidad
  const profit = totalSalePrice - (totalCost + form.externalCosts);

  const handleSave = () => {
    if (!selectedId || !form.clientName || form.unitPrice <= 0) {
      toast.error("Por favor, completa los datos de la venta");
      return;
    }

    if (form.quantity > (selectedService?.stock || 0)) {
      toast.error(`Solo quedan ${selectedService?.stock} unidades disponibles`);
      return;
    }

    setSaving(true);
    
    setTimeout(() => {
      try {
        const salesHistory = JSON.parse(sessionStorage.getItem("demo_service_sales") || "[]");
        const newSale = {
          id: Date.now().toString(),
          clientName: form.clientName,
          serviceData: `${selectedService?.name} (${selectedService?.months} meses)`,
          quantity: form.quantity,
          unitCost: selectedService?.unitCost || 0,
          totalCost: totalCost,
          externalCosts: form.externalCosts,
          unitPrice: form.unitPrice, // Guardamos el unitario
          salePrice: totalSalePrice, // Guardamos el TOTAL calculado
          profit: profit,
          saleDate: form.saleDate,
          customerEmail: selectedService?.email
        };
        sessionStorage.setItem("demo_service_sales", JSON.stringify([newSale, ...salesHistory]));

        const fullInventory = JSON.parse(sessionStorage.getItem("demo_available_services") || "[]");
        const updatedInventory = fullInventory.map((s: Service) => 
          s.id === selectedId ? { ...s, stock: s.stock - form.quantity } : s
        );
        sessionStorage.setItem("demo_available_services", JSON.stringify(updatedInventory));

        toast.success("Venta procesada con éxito");
        navigate("/demo/service-sales");
      } catch (e) {
        toast.error("Error al procesar la venta");
      } finally {
        setSaving(false);
      }
    }, 1000);
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-3xl p-4 mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Registrar Venta</h1>
      </div>

      <div className="glass-card p-6 space-y-6 border rounded-xl shadow-sm bg-card">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Servicio a entregar</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full bg-muted/50">
              <SelectValue placeholder={services.length > 0 ? "Seleccionar cuenta..." : "No hay stock"} />
            </SelectTrigger>
            <SelectContent>
              {services.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name} — {s.email} ({s.stock} disp.)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre del Cliente</Label>
            <Input value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} placeholder="Ej: Juan Pérez" />
          </div>
          <div className="space-y-2">
            <Label>Fecha de Venta</Label>
            <Input type="date" value={form.saleDate} onChange={e => setForm({...form, saleDate: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Precio Unitario ($)</Label>
            <Input type="number" value={form.unitPrice || ""} onChange={e => setForm({...form, unitPrice: Math.max(0, +e.target.value)})} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label>Cantidad</Label>
            <Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Math.max(1, +e.target.value)})} max={selectedService?.stock} />
          </div>
          <div className="space-y-2">
            <Label>Costos Extra</Label>
            <Input type="number" value={form.externalCosts || ""} onChange={e => setForm({...form, externalCosts: Math.max(0, +e.target.value)})} placeholder="0.00" />
          </div>
        </div>

        {selectedId && (
          <div className={`p-4 rounded-lg border ${profit >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Precio de Venta Total ({form.quantity} x ${form.unitPrice}):</span>
              <span className="font-bold text-foreground">${totalSalePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="font-semibold">Ganancia Neta:</span>
              <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${profit.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving || !selectedId || !form.clientName} className="w-full py-6 text-lg">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />} 
          Confirmar y Registrar Venta
        </Button>
      </div>
    </div>
  );
}



















