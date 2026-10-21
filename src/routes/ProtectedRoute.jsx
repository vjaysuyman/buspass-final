import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 20, textAlign: "center", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading session...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // Kung naay role restriction (e.g. operator lang), i-check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}