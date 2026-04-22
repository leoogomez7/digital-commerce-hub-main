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
      alert("Clave de servidor incorrecta");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-8 max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold">Acceso Protegido</h2>
          <Input 
            type="password" 
            placeholder="Clave maestra" 
            value={pass} 
            onChange={(e) => setPass(e.target.value)} 
          />
          <Button onClick={checkPass} className="w-full">Validar</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
