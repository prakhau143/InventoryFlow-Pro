import api from "./api";

export const customerService = {
  list: (params) => api.get("/api/customers", { params }),
  get: (id) => api.get(`/api/customers/${id}`),
  create: (data) => api.post("/api/customers", data),
  update: (id, data) => api.put(`/api/customers/${id}`, data),
  toggleStatus: (id) => api.patch(`/api/customers/${id}/toggle-status`),
  delete: (id) => api.delete(`/api/customers/${id}`),
};
