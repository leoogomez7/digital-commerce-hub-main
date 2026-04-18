import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, UserPlus } from "lucide-react";

export default function Register() {
  const { register, isLoading } = useKindeAuth();

  const handleRegister = () => {
    register({
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
          <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
        </div>

        <div className="glass-card p-6">
          <div className="space-y-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground">
                Recibirás un código en tu email para activar tu cuenta de forma segura.
              </p>
            </div>

            <Button
              type="button"
              disabled={isLoading}
              onClick={handleRegister}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 flex items-center justify-center gap-2 font-semibold"
            >
              {isLoading ? "Cargando..." : "Registrarse ahora"}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline font-medium">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
