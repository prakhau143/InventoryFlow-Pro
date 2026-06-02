import api from "./api";

export const orderService = {
  list: (params) => api.get("/api/orders", { params }),
  get: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post("/api/orders", data),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/orders/${id}`),
  exportCsv: () => api.get("/api/export/orders/csv", { responseType: "blob" }),
};
