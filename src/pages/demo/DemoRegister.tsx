import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Agregamos Input para realismo
import { Zap, UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";

export default function DemoRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleDemoRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Ingresa un correo");

    setIsLoading(true);

    // Simulamos la creación de cuenta demo
    setTimeout(() => {
      setIsLoading(false);
      // Guardamos la sesión volátil
      sessionStorage.setItem("is_demo", "true");
      sessionStorage.setItem("demo_user", JSON.stringify({ email }));
      
      toast.success("¡Cuenta demo creada con éxito!");
      navigate("/demo"); // Va al dashboard de la demo
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Control de ventas (DEMO)</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground italic underline decoration-primary">Prueba la versión gratuita</h1>
        </div>

        <div className="glass-card p-8 border border-primary/20">
          <form onSubmit={handleDemoRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email de prueba</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="tu@ejemplo.com" 
                  className="pl-10"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-bold">Nota:</span> Esta es una cuenta temporal. No necesitas un email real ni recibirás códigos de verificación en este modo.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 flex items-center justify-center gap-2 font-semibold"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Comenzar Demo Ahora
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Prefieres la versión real? <Link to="/register" className="text-primary hover:underline font-medium">Registrarse oficialmente</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
