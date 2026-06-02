import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowLeft, Package } from "lucide-react";
import { orderService } from "../services/orderService";

const STATUS_COLORS = {
  Pending: "badge-warning", Processing: "badge-info", Completed: "badge-success", Cancelled: "badge-danger",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.get(id)
      .then(r => setOrder(r.data))
      .catch(() => toast.error("Order not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{padding:40,textAlign:"center",color:"var(--text-muted)"}}>Loading…</div>;
  if (!order) return <div style={{padding:40,textAlign:"center",color:"var(--danger)"}}>Order not found</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>navigate("/orders")}><ArrowLeft size={14}/> Back</button>
          <div>
            <h2 className="page-title">Order #{order.id.toString().padStart(4,"0")}</h2>
            <p className="page-subtitle">Created {new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        <span className={`badge ${STATUS_COLORS[order.status]||"badge-muted"}`} style={{fontSize:"0.9rem",padding:"6px 16px"}}>{order.status}</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
        <motion.div className="glass" style={{padding:24,borderRadius:"var(--radius)"}} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}}>
          <h3 style={{fontWeight:700,marginBottom:16,fontSize:"0.9rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Order Info</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div className="info-row"><span className="info-label">Customer ID:</span><span className="info-value">#{order.customer_id}</span></div>
            <div className="info-row"><span className="info-label">Total Amount:</span><span className="info-value" style={{color:"var(--success)",fontWeight:700,fontSize:"1.1rem"}}>${order.total_amount.toFixed(2)}</span></div>
            <div className="info-row"><span className="info-label">Status:</span><span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span></div>
            {order.notes && <div className="info-row"><span className="info-label">Notes:</span><span className="info-value">{order.notes}</span></div>}
          </div>
        </motion.div>

        <motion.div className="glass" style={{padding:24,borderRadius:"var(--radius)"}} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}}>
          <h3 style={{fontWeight:700,marginBottom:16,fontSize:"0.9rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Summary</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div className="info-row"><span className="info-label">Items:</span><span className="info-value">{order.items.length} line items</span></div>
            <div className="info-row"><span className="info-label">Units:</span><span className="info-value">{order.items.reduce((s,i)=>s+i.quantity,0)}</span></div>
            <div className="info-row"><span className="info-label">Created:</span><span className="info-value">{new Date(order.created_at).toLocaleDateString()}</span></div>
            <div className="info-row"><span className="info-label">Updated:</span><span className="info-value">{new Date(order.updated_at).toLocaleDateString()}</span></div>
          </div>
        </motion.div>
      </div>

      <motion.div className="glass" style={{borderRadius:"var(--radius)"}} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border)"}}>
          <h3 style={{fontWeight:700}}>Order Items</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>Unit Price</th><th>Quantity</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:8,background:"rgba(99,102,241,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><Package size={14} color="var(--accent)"/></div>
                      <strong>{item.product?.name || `Product #${item.product_id}`}</strong>
                    </div>
                  </td>
                  <td><span style={{fontFamily:"monospace",fontSize:"0.8rem",background:"var(--bg-card)",padding:"2px 8px",borderRadius:4}}>{item.product?.sku || "—"}</span></td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td><span className="badge badge-info">×{item.quantity}</span></td>
                  <td><strong style={{color:"var(--success)"}}>${item.subtotal.toFixed(2)}</strong></td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} style={{textAlign:"right",fontWeight:700,fontSize:"1rem",color:"var(--text-secondary)"}}>Total:</td>
                <td><strong style={{color:"var(--success)",fontSize:"1.1rem"}}>${order.total_amount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
