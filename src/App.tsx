import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

// --- PÁGINAS REALES ---
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

// --- COMPONENTES DE SEGURIDAD Y DEMO ---
import { AdminGuard } from "./components/AdminGuard";
import DemoLogin from "./pages/demo/DemoLogin"; 
import DemoLayout from "./components/DemoLayout"; 

// --- PÁGINAS VERSIÓN DEMO ---
import DemoDashboard from "./pages/demo/DemoDashboard";
import DemoNewProduct from "./pages/demo/DemoNewProduct";
import DemoNewService from "./pages/demo/DemoNewService";
import DemoAvailableProducts from "./pages/demo/DemoAvailableProducts";
import DemoAvailableServices from "./pages/demo/DemoAvailableServices";
import DemoNewProductSale from "./pages/demo/DemoNewProductSale";
import DemoNewServiceSale from "./pages/demo/DemoNewServiceSale";
import DemoProductSales from "./pages/demo/DemoProductSales";
import DemoServiceSales from "./pages/demo/DemoServiceSales";
import DemoReportMonthly from "./pages/demo/DemoReportMonthly";
import DemoReportWeekly from "./pages/demo/DemoReportWeekly";
import DemoReportAnnual from "./pages/demo/DemoReportAnnual";
import DemoNotFound from "./pages/demo/DemoNotFound";

const queryClient = new QueryClient();

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
            {/* 1. RUTA PÚBLICA */}
            <Route path="/" element={<Landing />} />

            {/* 2. MUNDO REAL */}
            <Route path="/login" element={<AdminGuard><Login /></AdminGuard>} />
            <Route path="/register" element={<AdminGuard><Register /></AdminGuard>} />
            
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

            {/* 3. MUNDO DEMO (CORREGIDO) */}
            <Route path="/demo-start" element={<DemoLogin />} />
            <Route path="/demo" element={<DemoLayout />}> {/* <-- AQUÍ ESTABA EL ERROR */}
              <Route index element={<DemoDashboard />} />
              <Route path="new-product" element={<DemoNewProduct />} />
              <Route path="new-service" element={<DemoNewService />} />
              <Route path="available-products" element={<DemoAvailableProducts />} />
              <Route path="available-services" element={<DemoAvailableServices />} />
              <Route path="new-product-sale" element={<DemoNewProductSale />} />
              <Route path="new-service-sale" element={<DemoNewServiceSale />} />
              <Route path="product-sales" element={<DemoProductSales />} />
              <Route path="service-sales" element={<DemoServiceSales />} />
              <Route path="report-monthly" element={<DemoReportMonthly />} />
              <Route path="report-weekly" element={<DemoReportWeekly />} />
              <Route path="report-annual" element={<DemoReportAnnual />} />
              <Route path="*" element={<DemoNotFound />} />
            </Route>

            {/* 4. ERROR 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </KindeProvider>
);

export default App;