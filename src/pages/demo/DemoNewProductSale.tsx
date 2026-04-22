import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function DemoNewProductSale() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const [form, setForm] = useState({
    clientName: "", 
    salesChannel: "WhatsApp", 
    quantity: 1, 
    externalCosts: 0, 
    unitPrice: 0, // Cambiado de salePrice a unitPrice
    saleDate: new Date().toISOString().split('T')[0]
  });

  // CARGAR PRODUCTOS DESDE LA "DB" DE LA DEMO
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedProducts = JSON.parse(sessionStorage.getItem("demo_available_products") || "[]");
      
      if (savedProducts.length === 0) {
        const defaultProducts = [
          { id: "p1", name: "Mouse Inalámbrico", brand: "Logitech", quantity: 15, unitCost: 1200 },
          { id: "p2", name: "Teclado Mecánico", brand: "Redragon", quantity: 8, unitCost: 4500 },
        ];
        setProducts(defaultProducts);
      } else {
        setProducts(savedProducts);
      }
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const selectedProduct = products.find(p => p.id === selectedId);
  
  // Lógica de Negocio: Multiplicación solicitada
  const totalCost = form.quantity * (selectedProduct?.unitCost || 0);
  const totalSalePrice = form.quantity * form.unitPrice; // Cálculo automático
  const profit = totalSalePrice - totalCost - form.externalCosts;

  const confirmSave = () => {
    const currentStock = selectedProduct?.stock ?? selectedProduct?.quantity;
    if (form.quantity > currentStock) {
      toast.error("No hay suficiente stock disponible");
      setShowConfirm(false);
      return;
    }

    setSaving(true);
    
    setTimeout(() => {
      // 1. Guardar la venta en el historial
      const existingSales = JSON.parse(sessionStorage.getItem("demo_product_sales") || "[]");
      const newSale = {
        ...form,
        id: Date.now().toString(),
        productData: `${selectedProduct.name} (${selectedProduct.brand})`,
        salePrice: totalSalePrice, // Guardamos el TOTAL calculado
        totalCost,
        profit,
        createdAt: new Date().toISOString()
      };
      sessionStorage.setItem("demo_product_sales", JSON.stringify([newSale, ...existingSales]));

      // 2. Descontar stock
      const updatedProducts = products.map(p => 
        p.id === selectedId ? { ...p, stock: (p.stock ?? p.quantity) - form.quantity, quantity: (p.stock ?? p.quantity) - form.quantity } : p
      );
      sessionStorage.setItem("demo_available_products", JSON.stringify(updatedProducts));

      setSaving(false);
      setShowConfirm(false);
      toast.success("Venta registrada con éxito");
      navigate("/demo/product-sales");
    }, 1200);
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Cargando inventario demo...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Nueva Venta de Producto</h1>
        </div>
        <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded border border-primary/20 uppercase tracking-widest">
          Simulador
        </div>
      </div>

      <div className="glass-card p-6 space-y-4 border border-border/50 shadow-sm rounded-xl">
        <div className="flex items-center gap-2 text-primary mb-2">
          <ShoppingBag className="h-5 w-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Formulario de Venta</h2>
        </div>

        <Field label="Nombre del Cliente">
          <Input 
            placeholder="Ej: Juan Pérez"
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
                  {p.name} - {p.brand} ({(p.stock ?? p.quantity)} disponibles)
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
              placeholder="0.00"
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
