import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
