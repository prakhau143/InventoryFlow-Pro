import api from "./api";

export const customerService = {
  list: (params) => api.get("/api/customers", { params }),
  get: (id) => api.get(`/api/customers/${id}`),
  create: (data) => api.post("/api/customers", data),
  delete: (id) => api.delete(`/api/customers/${id}`),
};
