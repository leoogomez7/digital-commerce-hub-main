import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [pass, setPass] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkPass = () => {
    if (pass === import.meta.env.VITE_MASTER_PASSWORD) {
      setIsAuthorized(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="glass-card p-8 max-w-sm w-full text-center">
          <h2 className="text-xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-sm text-muted-foreground mb-6">Introduce la clave del servidor para continuar</p>
          <Input 
            type="password" 
            placeholder="Contraseña" 
            value={pass} 
            onChange={(e) => setPass(e.target.value)}
            className="mb-4"
          />
          <Button onClick={checkPass} className="w-full">Entrar</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
