import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Bus, Calendar, ScanLine, LogOut, Ticket, Megaphone } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function OperatorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="operator-container">
      
      {/* Mobile Top Header */}
      <div className="mobile-header" style={{ display: "none", padding: "1rem", background: "white", borderBottom: "1px solid var(--border-color)", justifyContent: "space-between", alignItems: "center", width: "100%", position: "fixed", top: 0, zIndex: 30 }}>
        <h1 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Ticket size={20} /> Operator
        </h1>
        <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", fontWeight: "600" }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Sidebar / Bottom Nav */}
      <aside className="operator-sidebar">
        <div className="operator-sidebar-header" style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--accent)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Ticket size={24} /> Operator Panel
          </h1>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>{user?.company || "BusPass Express"}</p>
        </div>

        <nav style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <SideNavItem to="/operator/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SideNavItem to="/operator/schedules" icon={<Calendar size={20} />} label="Schedules" />
          <SideNavItem to="/operator/buses" icon={<Bus size={20} />} label="Buses" />
          <SideNavItem to="/operator/scanner" icon={<ScanLine size={20} />} label="Scanner" /> {/* Gikuha nako ang 'QR' aron mubo */}
          <SideNavItem to="/operator/announcements" icon={<Megaphone size={20} />} label="Alerts" /> {/* Gikuha nako ang 'Announcements' */}
        </nav>

        <div className="operator-sidebar-logout" style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={handleLogout} style={{ 
            width: "100%", display: "flex", alignItems: "center", gap: "10px", 
            padding: "0.75rem", background: "transparent", border: "none", 
            color: "#F87171", cursor: "pointer", fontWeight: "600" 
          }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="operator-main">
        <Outlet />
      </main>
    </div>
  );
}

function SideNavItem({ to, icon, label }) {
  return (
    <NavLink 
      to={to} 
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        color: isActive ? "var(--text-main)" : "rgba(255,255,255,0.7)",
        background: isActive ? "var(--accent)" : "transparent",
        textDecoration: "none",
        fontWeight: isActive ? "700" : "500",
        transition: "all 0.2s"
      })}
    >
      {icon}
      {label}
    </NavLink>
  );
}