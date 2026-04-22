import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function DemoLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", pass: "" });

  const handleEnter = () => {
    if (!form.email) {
      toast.error("Por favor, ingresa un correo de prueba");
      return;
    }

    setLoading(true);

    // Simulamos una pequeña espera de "validación"
    setTimeout(() => {
      // Guardamos la sesión demo
      sessionStorage.setItem("is_demo", "true");
      sessionStorage.setItem("demo_user", JSON.stringify({ 
        email: form.email,
        name: form.email.split('@')[0] 
      }));
      
      setLoading(false);
      toast.success("¡Bienvenido a la demo!");
      navigate("/demo"); // Dirige al Dashboard del mundo demo
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <div className="glass-card p-8 max-w-sm w-full text-center border border-primary/20 shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Zap className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Acceso Demo</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Explora todas las funciones sin necesidad de una cuenta real.
        </p>
        
        <div className="space-y-4">
          <div className="text-left space-y-1.5">
            <Input 
              type="email"
              placeholder="Correo de prueba (ej: juan@demo.com)" 
              className="bg-muted/50 border-border" 
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
          </div>
          
          <div className="text-left space-y-1.5">
            <Input 
              type="password" 
              placeholder="Contraseña (cualquiera)" 
              className="bg-muted/50 border-border"
              onChange={(e) => setForm({...form, pass: e.target.value})}
            />
          </div>

          <Button 
            onClick={handleEnter} 
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              "Comenzar prueba gratuita"
            )}
          </Button>
        </div>

        <p className="mt-6 text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
          Entorno de pruebas volátil
        </p>
      </div>
    </div>
  );
}
