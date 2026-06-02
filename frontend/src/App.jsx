import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import InventoryHistoryPage from "./pages/InventoryHistoryPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text-muted)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚡</div>
        <div>Loading InventoryFlow Pro…</div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"  element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/products"   element={<ProtectedRoute><Layout><ProductsPage /></Layout></ProtectedRoute>} />
      <Route path="/customers"  element={<ProtectedRoute><Layout><CustomersPage /></Layout></ProtectedRoute>} />
      <Route path="/orders"     element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
      <Route path="/orders/new" element={<ProtectedRoute><Layout><CreateOrderPage /></Layout></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetailPage /></Layout></ProtectedRoute>} />
      <Route path="/audit-logs"        element={<ProtectedRoute><Layout><AuditLogsPage /></Layout></ProtectedRoute>} />
      <Route path="/inventory-history" element={<ProtectedRoute><Layout><InventoryHistoryPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
          style={{ zIndex: 9999 }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
