import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, UserPlus } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Completa todos los campos");
      return;
    }
    toast.success("Cuenta creada. Revisa tu email para activar tu cuenta.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Control de ventas</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">Regístrate para comenzar</p>
        </div>

        <div className="glass-card p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground text-sm">Nombre</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10">
              <UserPlus className="mr-2 h-4 w-4" /> Crear cuenta
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
