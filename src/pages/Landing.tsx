import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Package, FileText, TrendingUp, Shield, ArrowRight, Zap } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Control de Ventas", desc: "Gestiona todas tus ventas de productos y servicios digitales en un solo lugar." },
  { icon: Users, title: "Gestión de Clientes", desc: "Administra tu cartera de clientes con información detallada y seguimiento." },
  { icon: Package, title: "Gestión de Stock", desc: "Controla tu inventario en tiempo real y evita faltantes." },
  { icon: FileText, title: "Reportes Automáticos", desc: "Reportes semanales, mensuales y anuales generados automáticamente." },
  { icon: TrendingUp, title: "Ganancias Automáticas", desc: "Cálculo automático de ganancias por cada venta realizada." },
  { icon: Shield, title: "Plataforma Segura", desc: "Tu información protegida con los más altos estándares de seguridad." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Control de ventas</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")} className="text-muted-foreground hover:text-foreground">Ingresar</Button>
            <Button onClick={() => navigate("/register")} className="bg-primary text-primary-foreground hover:bg-primary/90">Crear cuenta</Button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-8">
            <Zap className="h-3.5 w-3.5" /> Plataforma de Gestión Digital
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Gestiona tus </span>
            <span className="gradient-text">ventas</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Sistema completo para la gestión de ventas de productos y servicios digitales. Control total de clientes, gastos y ganancias automáticas.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/register")} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base">
              Comenzar gratis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="border-border text-foreground hover:bg-muted h-12 px-8 text-base">Ingresar</Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Todo lo que necesitas</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">Herramientas profesionales para gestionar tu negocio digital de forma eficiente.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-6 hover:border-primary/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">¿Listo para comenzar?</h2>
            <p className="text-muted-foreground mb-8">Crea tu cuenta gratuita y comienza a gestionar tus ventas hoy mismo.</p>
            <Button size="lg" onClick={() => navigate("/register")} className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-12">Crear cuenta gratuita</Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">© 2026 Control de ventas. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}
