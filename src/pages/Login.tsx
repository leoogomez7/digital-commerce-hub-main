import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Mail } from "lucide-react";

export default function Login() {
  const { login, isAuthenticated, isLoading } = useKindeAuth();
  const navigate = useNavigate();

  // IMPORTANTE: Solo redirigir si NO está cargando
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  if (isLoading || isAuthenticated) {
    return <div className="h-screen flex items-center justify-center">Verificando...</div>;
  }


  const handleLogin = () => {
    login({
      redirectURL: `${window.location.origin}/dashboard`
    });
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
        </div>

        <div className="glass-card p-6 space-y-6">
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 flex items-center justify-center gap-2 text-lg font-medium"
          >
            <Mail className="h-5 w-5" /> 
            {isLoading ? "Cargando..." : "Ingresar con Email"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta? <Link to="/register" className="text-primary hover:underline font-medium">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
