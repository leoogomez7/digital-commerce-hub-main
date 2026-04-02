import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/auth";
import { toast } from "sonner";
import { Zap, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Completa todos los campos");
      return;
    }
    loginUser({ name: email.split("@")[0], email, isActive: true });
    toast.success("Sesión iniciada correctamente");
    navigate("/dashboard");
  };

  const handleSocial = (provider: string) => {
    toast.info(`Para login con ${provider} se necesita configurar el proveedor OAuth. Por ahora se inicia sesión de demostración.`);
    loginUser({ name: provider + " User", email: provider.toLowerCase() + "@demo.com", isActive: true });
    toast.success(`Sesión iniciada con ${provider}`);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Control de ventas</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground mt-1">Ingresa a tu cuenta para continuar</p>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => handleSocial("Google")} className="border-border text-foreground hover:bg-muted text-xs h-10">Google</Button>
            <Button variant="outline" onClick={() => handleSocial("Microsoft")} className="border-border text-foreground hover:bg-muted text-xs h-10">Microsoft</Button>
            <Button variant="outline" onClick={() => handleSocial("Facebook")} className="border-border text-foreground hover:bg-muted text-xs h-10">Facebook</Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">o continúa con email</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10">
              <Mail className="mr-2 h-4 w-4" /> Ingresar
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-primary hover:underline">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
