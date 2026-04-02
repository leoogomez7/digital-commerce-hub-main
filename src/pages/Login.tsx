import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, Mail} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loginWithGoogle, isAuthenticated } from "@/lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirigir si ya está logueado
  useEffect(() => {
    isAuthenticated().then(auth => {
      if (auth) navigate("/dashboard");
    });
  }, []);

  // Login con email/password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        toast.error("Usuario no encontrado o cuenta no activada. Revisa tu correo.");
        return;
      }

      toast.success(`Bienvenido ${data.user.email}`);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error login:", err.message);
      toast.error("Usuario no encontrado por error de datos o no activo la cuenta");
    } finally {
      setLoading(false);
    }
  };

  // Login con Google
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Supabase redirige automáticamente
    } catch (err) {
      console.error(err);
      toast.error("Error al iniciar sesión con Google");
    }
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
          {/* Botón Google */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="border-border text-foreground hover:bg-muted text-xs h-10 flex items-center gap-2"
            >
            Google
            </Button>
          </div>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">o continúa con correo</span>
            </div>
          </div>

          {/* Form email/password */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm">Correo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 flex items-center justify-center gap-2"
            >
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