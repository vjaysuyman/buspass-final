import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Ticket, Calendar, User, LogOut, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { notificationApi } from "../services/notificationApi";

export default function PassengerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadUnread() {
      try {
        const list = await notificationApi.getMine();
        setUnreadCount(list.filter((n) => !n.is_read).length);
      } catch (err) {
        console.error(err);
      }
    }
    if (user) loadUnread();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg-color)" }}>
      {/* HEADER */}
      <header style={{ 
        background: "var(--surface)", 
        padding: "0.75rem 1rem", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        position: "sticky", 
        top: 0, 
        zIndex: 10, 
        borderBottom: "1px solid var(--border-color)"
      }}>
        {/* Logo sa Wala */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <div style={{ background: "var(--primary)", color: "white", padding: "6px", borderRadius: "8px" }}>
            <Ticket size={20} />
          </div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)", display: "none" }}>BUSPASS</h1>
        </div>

        {/* User Profile sa Tuo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ textAlign: "right", lineHeight: "1.2" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "500" }}>Hi,</p>
            <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.first_name}
            </p>
          </div>
          
          <div
            onClick={() => navigate("/passenger/profile")}
            style={{ cursor: "pointer" }}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #ccfbf1" }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ccfbf1", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: "bold" }}>
                {user?.first_name?.[0]?.toUpperCase() || "P"}
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, paddingBottom: "85px" }}>
        <Outlet />
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav style={{ 
        position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--surface)", 
        boxShadow: "var(--shadow-float)", display: "flex", justifyContent: "space-around",
        padding: "0.6rem 0.25rem", paddingBottom: "calc(0.6rem + env(safe-area-inset-bottom))", zIndex: 10
      }}>
        <NavItem to="/passenger/home" icon={<Home size={22} />} label="Home" />
        <NavItem to="/passenger/bookings" icon={<Calendar size={22} />} label="Bookings" />
        <NavItem to="/passenger/tickets" icon={<Ticket size={22} />} label="Tickets" />
        <NavItem to="/passenger/notifications" icon={<Bell size={22} />} label="Alerts" hasBadge={unreadCount > 0} />
        <NavItem to="/passenger/profile" icon={<User size={22} />} label="Profile" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, hasBadge }) {
  return (
    <NavLink 
      to={to} 
      style={({ isActive }) => ({
        display: "flex", flexDirection: "column", alignItems: "center",
        color: isActive ? "var(--primary)" : "var(--text-muted)",
        textDecoration: "none", fontSize: "0.65rem", fontWeight: isActive ? "700" : "500", gap: "4px",
        padding: "0.25rem 0.5rem", borderRadius: "12px", background: isActive ? "#ccfbf1" : "transparent", 
        transition: "all 0.2s", flex: 1, justifyContent: "center"
      })}
    >
      <div style={{ position: "relative" }}>
        {icon}
        {hasBadge && <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#EF4444", borderRadius: "50%" }} />}
      </div>
      {label}
    </NavLink>
  );
}