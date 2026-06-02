import api from "./api";

export const dashboardService = {
  getStats: () => api.get("/api/dashboard/stats"),
  getLowStock: () => api.get("/api/dashboard/low-stock"),
  getOrdersTrend: () => api.get("/api/dashboard/orders-trend"),
  getInventoryDistribution: () => api.get("/api/dashboard/inventory-distribution"),
  getTopProducts: () => api.get("/api/dashboard/top-products"),
  getRecentActivity: () => api.get("/api/dashboard/recent-activity"),
};
