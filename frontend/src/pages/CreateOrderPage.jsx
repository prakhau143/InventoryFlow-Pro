import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Plus, Trash2, ArrowLeft, ShoppingCart } from "lucide-react";
import { orderService } from "../services/orderService";
import { customerService } from "../services/customerService";
import { productService } from "../services/productService";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    customerService.list({ per_page: 100 }).then(r => setCustomers(r.data.items));
    productService.list({ per_page: 100 }).then(r => setProducts(r.data.items));
  }, []);

  const addItem = () => setItems([...items, { product_id: "", quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    setItems(next);
  };

  const getProduct = (id) => products.find(p => p.id === parseInt(id));

  const subtotal = items.reduce((sum, item) => {
    const p = getProduct(item.product_id);
    return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) return toast.error("Please select a customer");
    const validItems = items.filter(i => i.product_id && parseInt(i.quantity) > 0);
    if (!validItems.length) return toast.error("Add at least one item with valid quantity");

    setSubmitting(true);
    try {
      const res = await orderService.create({
        customer_id: parseInt(customerId),
        notes: notes || undefined,
        items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
      });
      toast.success(`Order #${res.data.id} created! Total: $${res.data.total_amount.toFixed(2)}`);
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create order");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/orders")}><ArrowLeft size={14}/> Back</button>
          <div>
            <h2 className="page-title">Create New Order</h2>
            <p className="page-subtitle">Select customer and add products</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Customer */}
            <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Customer</h3>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Select Customer *</label>
                <select className="select" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                  <option value="">— Choose a customer —</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                </select>
              </div>
            </motion.div>

            {/* Items */}
            <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700 }}>Order Items</h3>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={14}/> Add Item</button>
              </div>

              {/* Header row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 90px 36px", gap: 8, marginBottom: 8 }}>
                <div className="form-label">Product</div>
                <div className="form-label">Qty</div>
                <div className="form-label">Subtotal</div>
                <div/>
              </div>

              {items.map((item, i) => {
                const p = getProduct(item.product_id);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 90px 36px", gap: 8, marginBottom: 10, alignItems: "center" }}>
                    <select className="select" value={item.product_id} onChange={e => updateItem(i, "product_id", e.target.value)}>
                      <option value="">Select product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                    </select>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      max={p?.quantity || 9999}
                      value={item.quantity}
                      onChange={e => updateItem(i, "quantity", e.target.value)}
                    />
                    <div style={{ padding: "10px 0", fontWeight: 600, color: "var(--success)" }}>
                      {p ? `$${(p.price * (parseInt(item.quantity) || 0)).toFixed(2)}` : "—"}
                    </div>
                    <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => removeItem(i)} disabled={items.length === 1}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                );
              })}

              {/* Stock warnings */}
              {items.map((item, i) => {
                const p = getProduct(item.product_id);
                if (p && parseInt(item.quantity) > p.quantity) {
                  return <p key={i} className="form-error">⚠ {p.name}: only {p.quantity} in stock</p>;
                }
                return null;
              })}
            </motion.div>

            {/* Notes */}
            <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Notes (Optional)</h3>
              <textarea className="textarea" rows={3} placeholder="Any special instructions or notes…" value={notes} onChange={e => setNotes(e.target.value)}/>
            </motion.div>
          </div>

          {/* Right column — order summary */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass" style={{ padding: 24, borderRadius: "var(--radius)", position: "sticky", top: 90 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {items.map((item, i) => {
                  const p = getProduct(item.product_id);
                  if (!p) return null;
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{p.name} ×{item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>${(p.price * (parseInt(item.quantity) || 0)).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="divider"/>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <span style={{ fontWeight: 700, fontSize: "1rem" }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: "1.4rem", color: "var(--success)" }}>${subtotal.toFixed(2)}</span>
              </div>
              <button type="submit" className="btn btn-primary pulse-glow" style={{ width: "100%", justifyContent: "center", padding: "12px" }} disabled={submitting}>
                <ShoppingCart size={16}/> {submitting ? "Creating…" : "Place Order"}
              </button>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
                Stock will be deducted automatically
              </p>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
