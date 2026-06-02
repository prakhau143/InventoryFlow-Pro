import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, RefreshCw, Users } from "lucide-react";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { SkeletonTable } from "../components/ui/LoadingSkeleton";
import { customerService } from "../services/customerService";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.list({ page, per_page: 10, search: search || undefined });
      setCustomers(res.data.items);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error("Failed to load customers"); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await customerService.create(data);
      toast.success("Customer added!");
      setModalOpen(false);
      reset();
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to add customer"); } finally { setSubmitting(false); }
  };

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
        <button className="btn btn-primary" onClick={() => { reset(); setModalOpen(true); }}>
          <Plus size={16}/> Add Customer
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <Search className="icon" size={15}/>
          <input className="input" placeholder="Search by name or email…" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}}/>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14}/></button>
      </div>

      <motion.div className="glass" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
        {loading ? <SkeletonTable rows={5} cols={5}/> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><Users size={40}/><h3>No customers yet</h3><p>Add your first customer</p></div></td></tr>
                ) : customers.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color:"var(--text-muted)", width:40 }}>{(page-1)*10+i+1}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div className="avatar" style={{ width:32, height:32, fontSize:"0.75rem" }}>{c.full_name[0].toUpperCase()}</div>
                        <strong>{c.full_name}</strong>
                      </div>
                    </td>
                    <td style={{ color:"var(--accent)" }}>{c.email}</td>
                    <td style={{ color:"var(--text-secondary)" }}>{c.phone || "—"}</td>
                    <td style={{ color:"var(--text-muted)", fontSize:"0.8rem" }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={()=>setDeleteId(c.id)}><Trash2 size={13}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={setPage}/>
      </motion.div>

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title="Add New Customer">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="input" placeholder="Jane Doe" {...register("full_name",{required:"Required"})}/>
            {errors.full_name && <p className="form-error">{errors.full_name.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="input" type="email" placeholder="jane@company.com" {...register("email",{required:"Required"})}/>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" placeholder="+1 555 0100" {...register("phone")}/>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="input" placeholder="123 Main St" {...register("address")}/>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={()=>setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting?"Saving…":"Add Customer"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={()=>setDeleteId(null)} title="Delete Customer">
        <p style={{color:"var(--text-secondary)"}}>This will permanently delete the customer and may affect their orders.</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={()=>setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
