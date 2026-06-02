import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const titles = {
  "/dashboard":         "Dashboard",
  "/products":          "Products",
  "/customers":         "Customers",
  "/orders":            "Orders",
  "/orders/new":        "Create Order",
  "/audit-logs":        "Audit Logs",
  "/inventory-history": "Stock History",
};

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = titles[pathname] || "InventoryFlow Pro";

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header onMenuToggle={() => setSidebarOpen((o) => !o)} title={title} />
        <main className="page-container fade-in">{children}</main>
      </div>
    </div>
  );
}
