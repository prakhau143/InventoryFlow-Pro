import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, RefreshCw, Users, Eye, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { SkeletonTable } from "../components/ui/LoadingSkeleton";
import CustomerDetailModal from "../components/ui/CustomerDetailModal";
import { customerService } from "../services/customerService";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);  // null = closed
  const [deleteId, setDeleteId] = useState(null);
  const [detailCustomer, setDetailCustomer] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const { register: regCreate, handleSubmit: hsCreate, reset: resetCreate, formState: { errors: errCreate } } = useForm();
  const { register: regEdit, handleSubmit: hsEdit, reset: resetEdit, formState: { errors: errEdit } } = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.list({
        page,
        per_page: 10,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setCustomers(res.data.items);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error("Failed to load customers"); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // CREATE
  const onCreate = async (data) => {
    setSubmitting(true);
    try {
      await customerService.create(data);
      toast.success("Customer added!");
      setCreateOpen(false);
      resetCreate();
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to add customer"); }
    finally { setSubmitting(false); }
  };

  // EDIT OPEN — prefill form
  const openEdit = (c) => {
    setEditCustomer(c);
    resetEdit({
      full_name: c.full_name,
      email: c.email,
      phone: c.phone || "",
      address: c.address || "",
      notes: c.notes || "",
    });
  };

  // EDIT SAVE
  const onEdit = async (data) => {
    setSubmitting(true);
    try {
      await customerService.update(editCustomer.id, data);
      toast.success("Customer updated!");
      setEditCustomer(null);
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Update failed"); }
    finally { setSubmitting(false); }
  };

  // TOGGLE ACTIVE
  const handleToggle = async (c) => {
    setTogglingId(c.id);
    try {
      await customerService.toggleStatus(c.id);
      toast.success(`${c.full_name} ${c.is_active ? "deactivated" : "activated"}`);
      load();
    } catch { toast.error("Toggle failed"); }
    finally { setTogglingId(null); }
  };

  // DELETE
  const handleDelete = async () => {
    try {
      await customerService.delete(deleteId);
      toast.success("Customer deleted");
      setDeleteId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Delete failed"); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">{total} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetCreate(); setCreateOpen(true); }}>
          <Plus size={16}/> Add Customer
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <Search className="icon" size={15}/>
          <input
            className="input"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ width: "auto", minWidth: 130, paddingRight: 32 }}
        >
          <option value="all">All Customers</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14}/></button>
      </div>

      <motion.div className="glass" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {loading ? <SkeletonTable rows={5} cols={7}/> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state"><Users size={40}/><h3>No customers found</h3><p>Add your first customer or adjust filters</p></div>
                  </td></tr>
                ) : customers.map((c, i) => (
                  <tr key={c.id} style={{ opacity: c.is_active ? 1 : 0.6 }}>
                    <td style={{ color: "var(--text-muted)", width: 40 }}>{(page-1)*10+i+1}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          className="avatar"
                          style={{
                            width: 32, height: 32, fontSize: "0.75rem",
                            background: c.is_active
                              ? "linear-gradient(135deg,#6366f1,#06b6d4)"
                              : "var(--bg-card)",
                            color: c.is_active ? "#fff" : "var(--text-muted)",
                            border: c.is_active ? "none" : "1px solid var(--border)",
                          }}
                        >
                          {c.full_name[0].toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: "0.875rem" }}>{c.full_name}</strong>
                          {c.notes && (
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--accent)", fontSize: "0.875rem" }}>{c.email}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{c.phone || "—"}</td>
                    <td>
                      {/* Active / Inactive toggle */}
                      <button
                        onClick={() => handleToggle(c)}
                        disabled={togglingId === c.id}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6, padding: 0,
                          color: c.is_active ? "var(--success)" : "var(--text-muted)",
                          opacity: togglingId === c.id ? 0.5 : 1,
                          transition: "color 0.2s",
                        }}
                        title={c.is_active ? "Click to deactivate" : "Click to activate"}
                      >
                        {c.is_active
                          ? <ToggleRight size={22} color="var(--success)" />
                          : <ToggleLeft size={22} color="var(--text-muted)" />
                        }
                        <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {/* View detail */}
                        <button
                          className="btn-icon btn-secondary btn-sm"
                          title="View details"
                          onClick={() => setDetailCustomer(c)}
                          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "var(--accent)", display: "flex", alignItems: "center" }}
                        >
                          <Eye size={13}/>
                        </button>
                        {/* Edit */}
                        <button
                          className="btn-icon btn-secondary btn-sm"
                          title="Edit customer"
                          onClick={() => openEdit(c)}
                          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}
                        >
                          <Edit2 size={13}/>
                        </button>
                        {/* Delete */}
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          title="Delete customer"
                          onClick={() => setDeleteId(c.id)}
                        >
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={setPage}/>
      </motion.div>

      {/* ── CREATE MODAL ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Customer">
        <form onSubmit={hsCreate(onCreate)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="input" placeholder="Jane Doe" {...regCreate("full_name", { required: "Required" })}/>
              {errCreate.full_name && <p className="form-error">{errCreate.full_name.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="input" type="email" placeholder="jane@company.com" {...regCreate("email", { required: "Required" })}/>
              {errCreate.email && <p className="form-error">{errCreate.email.message}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" placeholder="+1 555 0100" {...regCreate("phone")}/>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="input" placeholder="123 Main St" {...regCreate("address")}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="input" rows={2} placeholder="Any notes about this customer…" style={{ resize: "vertical" }} {...regCreate("notes")}/>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving…" : "Add Customer"}</button>
          </div>
        </form>
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal open={!!editCustomer} onClose={() => setEditCustomer(null)} title="Edit Customer">
        <form onSubmit={hsEdit(onEdit)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="input" {...regEdit("full_name", { required: "Required" })}/>
              {errEdit.full_name && <p className="form-error">{errEdit.full_name.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="input" type="email" {...regEdit("email", { required: "Required" })}/>
              {errEdit.email && <p className="form-error">{errEdit.email.message}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" {...regEdit("phone")}/>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="input" {...regEdit("address")}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="input" rows={2} style={{ resize: "vertical" }} {...regEdit("notes")}/>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setEditCustomer(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving…" : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      {/* ── DELETE CONFIRM ── */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Customer">
        <p style={{ color: "var(--text-secondary)" }}>This will permanently delete the customer and may affect their orders.</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>

      {/* ── DETAIL PANEL ── */}
      <CustomerDetailModal
        customer={detailCustomer}
        onClose={() => setDetailCustomer(null)}
        onEdit={(c) => { setDetailCustomer(null); openEdit(c); }}
      />
    </div>
  );
}
