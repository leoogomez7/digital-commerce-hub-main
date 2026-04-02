// Store for available products/services (inventory) and sales

export interface AvailableProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  size: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplierName: string;
  purchaseDate: string;
  trackingNumber: string;
  description: string;
  observations: string;
  createdAt: string;
}

export interface AvailableService {
  id: string;
  type: string;
  months: number;
  email: string;
  password: string;
  accessCodes: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplierName: string;
  purchaseDate: string;
  description: string;
  observations: string;
  createdAt: string;
}

export interface ProductSale {
  id: string;
  clientName: string;
  phone: string;
  instagram: string;
  facebook: string;
  clientEmail: string;
  salesChannel: string;
  productId: string;
  productData: string;
  saleDate: string;
  shippingDate: string;
  trackingNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  externalCosts: number;
  salePrice: number;
  profit: number;
  description: string;
  observations: string;
  createdAt: string;
}

export interface ServiceSale {
  id: string;
  clientName: string;
  phone: string;
  instagram: string;
  facebook: string;
  clientEmail: string;
  salesChannel: string;
  serviceId: string;
  serviceData: string;
  saleDate: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  externalCosts: number;
  salePrice: number;
  profit: number;
  description: string;
  observations: string;
  createdAt: string;
}

const KEYS = {
  products: 'cv_available_products',
  services: 'cv_available_services',
  productSales: 'cv_product_sales',
  serviceSales: 'cv_service_sales',
};

function get<T>(key: string): T[] {
  const d = localStorage.getItem(key);
  return d ? JSON.parse(d) : [];
}
function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Available Products
export const getAvailableProducts = () => get<AvailableProduct>(KEYS.products);
export const saveAvailableProduct = (p: AvailableProduct) => { const all = getAvailableProducts(); all.push(p); set(KEYS.products, all); };
export const updateAvailableProduct = (p: AvailableProduct) => set(KEYS.products, getAvailableProducts().map(x => x.id === p.id ? p : x));
export const deleteAvailableProduct = (id: string) => set(KEYS.products, getAvailableProducts().filter(x => x.id !== id));

// Available Services
export const getAvailableServices = () => get<AvailableService>(KEYS.services);
export const saveAvailableService = (s: AvailableService) => { const all = getAvailableServices(); all.push(s); set(KEYS.services, all); };
export const updateAvailableService = (s: AvailableService) => set(KEYS.services, getAvailableServices().map(x => x.id === s.id ? s : x));
export const deleteAvailableService = (id: string) => set(KEYS.services, getAvailableServices().filter(x => x.id !== id));

// Product Sales
export const getProductSales = () => get<ProductSale>(KEYS.productSales);
export const saveProductSale = (s: ProductSale) => { const all = getProductSales(); all.push(s); set(KEYS.productSales, all); };
export const updateProductSale = (s: ProductSale) => set(KEYS.productSales, getProductSales().map(x => x.id === s.id ? s : x));
export const deleteProductSale = (id: string) => set(KEYS.productSales, getProductSales().filter(x => x.id !== id));

// Service Sales
export const getServiceSales = () => get<ServiceSale>(KEYS.serviceSales);
export const saveServiceSale = (s: ServiceSale) => { const all = getServiceSales(); all.push(s); set(KEYS.serviceSales, all); };
export const updateServiceSale = (s: ServiceSale) => set(KEYS.serviceSales, getServiceSales().map(x => x.id === s.id ? s : x));
export const deleteServiceSale = (id: string) => set(KEYS.serviceSales, getServiceSales().filter(x => x.id !== id));

// Reduce quantity in available product/service after sale
export function reduceProductQuantity(productId: string, qty: number) {
  const p = getAvailableProducts().find(x => x.id === productId);
  if (p) { p.quantity = Math.max(0, p.quantity - qty); updateAvailableProduct(p); }
}
export function reduceServiceQuantity(serviceId: string, qty: number) {
  const s = getAvailableServices().find(x => x.id === serviceId);
  if (s) { s.quantity = Math.max(0, s.quantity - qty); updateAvailableService(s); }
}

export function generateId(): string {
  return crypto.randomUUID();
}

// Helper to build product data string
export function buildProductData(p: AvailableProduct): string {
  return [p.name, p.brand, p.category, p.size].filter(Boolean).join(" | ");
}
export function buildServiceData(s: AvailableService): string {
  return [s.type, `${s.months} meses`, s.email, s.password, s.accessCodes].filter(Boolean).join(" | ");
}
