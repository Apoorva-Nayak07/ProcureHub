import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login         from "../pages/Login";
import Register      from "../pages/Register";
import Dashboard     from "../pages/Dashboard";
import CreatePO      from "../pages/CreatePO";
import ViewBids      from "../pages/ViewBids";
import Marketplace   from "../pages/Marketplace";
import SubmitBid     from "../pages/SubmitBid";
import MyBids        from "../pages/MyBids";
import Analytics     from "../pages/Analytics";
import Notifications from "../pages/Notifications";

function PrivateRoute({ children, role: requiredRole }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === "vendor" ? "/marketplace" : "/dashboard"} replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Manager only */}
        <Route path="/dashboard" element={<PrivateRoute role="procurement_manager"><Dashboard /></PrivateRoute>} />
        <Route path="/create-po" element={<PrivateRoute role="procurement_manager"><CreatePO /></PrivateRoute>} />
        <Route path="/po/:poId/bids" element={<PrivateRoute role="procurement_manager"><ViewBids /></PrivateRoute>} />

        {/* Vendor only */}
        <Route path="/marketplace"      element={<PrivateRoute role="vendor"><Marketplace /></PrivateRoute>} />
        <Route path="/submit-bid/:poId" element={<PrivateRoute role="vendor"><SubmitBid /></PrivateRoute>} />
        <Route path="/my-bids"          element={<PrivateRoute role="vendor"><MyBids /></PrivateRoute>} />

        {/* Both roles */}
        <Route path="/analytics"     element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
