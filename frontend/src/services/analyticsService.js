import api from "./api";

export const analyticsService = {
  products:  () => api.get("/api/products/analytics"),
  customers: () => api.get("/api/customers/analytics"),
  orders:    () => api.get("/api/orders/analytics"),
  inventory: () => api.get("/api/inventory-history/analytics"),
};
