import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const DemoNotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Registramos el error en consola para depuración
    console.error("Demo 404: Ruta no encontrada ->", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center animate-fade-in">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 bg-primary/10 rounded-full">
            <FileQuestion className="h-16 w-16 text-primary opacity-50" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-primary/20">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Página no encontrada</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            La sección que buscas no existe en esta versión demo o ha sido movida.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild variant="default">
            <Link to="/demo" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Panel Demo
            </Link>
          </Button>
          
          <Button asChild variant="ghost">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              Ir a la página principal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DemoNotFound;
