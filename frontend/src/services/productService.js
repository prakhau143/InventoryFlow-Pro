import api from "./api";

export const productService = {
  list: (params) => api.get("/api/products", { params }),
  get: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post("/api/products", data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
  exportCsv: () => api.get("/api/export/products/csv", { responseType: "blob" }),
};
