import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import { Loader2 } from "lucide-react";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import NewProduct from "./pages/NewProduct";
import NewService from "./pages/NewService";
import AvailableProducts from "./pages/AvailableProducts";
import AvailableServices from "./pages/AvailableServices";
import NewProductSale from "./pages/NewProductSale";
import NewServiceSale from "./pages/NewServiceSale";
import ProductSales from "./pages/ProductSales";
import ServiceSales from "./pages/ServiceSales";
import ReportMonthly from "./pages/ReportMonthly";
import ReportWeekly from "./pages/ReportWeekly";
import ReportAnnual from "./pages/ReportAnnual";
import NotFound from "./pages/NotFound";
import { AdminGuard } from "./components/AdminGuard";

const queryClient = new QueryClient();

// Componente auxiliar para procesar el acceso a la demo
const DemoAccess = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.setItem("is_demo", "true");
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

const App = () => (
  <KindeProvider
    clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
    domain={import.meta.env.VITE_KINDE_DOMAIN}
    redirectUri={`${window.location.origin}/dashboard`} 
    logoutUri={`${window.location.origin}/login`} 
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* 1. Página de inicio */}
            <Route path="/" element={<Landing />} />

            {/* 2. Acceso a Demo Protegido por Contraseña Maestra */}
            <Route path="/demo-access" element={<AdminGuard><DemoAccess /></AdminGuard>} />

            {/* 3. Autenticación de Kinde (Libre para registro de usuarios reales) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 4. Dashboard (Protegido internamente por Kinde o sesión Demo) */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="new-product" element={<NewProduct />} />
              <Route path="new-service" element={<NewService />} />
              <Route path="available-products" element={<AvailableProducts />} />
              <Route path="available-services" element={<AvailableServices />} />
              <Route path="new-product-sale" element={<NewProductSale />} />
              <Route path="new-service-sale" element={<NewServiceSale />} />
              <Route path="product-sales" element={<ProductSales />} />
              <Route path="service-sales" element={<ServiceSales />} />
              <Route path="report-monthly" element={<ReportMonthly />} />
              <Route path="report-weekly" element={<ReportWeekly />} />
              <Route path="report-annual" element={<ReportAnnual />} />
            </Route>

            {/* 5. Ruta no encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </KindeProvider>
);

export default App;
