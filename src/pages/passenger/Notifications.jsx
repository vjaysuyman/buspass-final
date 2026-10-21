import { useState, useEffect } from "react";
import { Bell, CheckCircle, CreditCard, Clock, Info } from "lucide-react";
import { notificationApi } from "../../services/notificationApi";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await notificationApi.getMine();
        setNotifications(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleMarkRead = async (id) => {
    await notificationApi.markAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'booking': return <CheckCircle size={20} color="#10B981" />;
      case 'payment': return <CreditCard size={20} color="#3B82F6" />;
      case 'reminder': return <Clock size={20} color="#F59E0B" />;
      default: return <Info size={20} color="#64748B" />;
    }
  };

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading notifications...</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "var(--text-main)" }}>Notifications</h2>

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <Bell size={48} style={{ color: "var(--text-muted)", opacity: 0.3, margin: "0 auto 1rem auto" }} />
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No notifications</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className="card" 
              onClick={() => !notif.is_read && handleMarkRead(notif.id)}
              style={{ 
                padding: "1rem", 
                cursor: notif.is_read ? "default" : "pointer",
                background: notif.is_read ? "white" : "#F0FDF4",
                borderLeft: notif.is_read ? "1px solid var(--border-color)" : "4px solid var(--primary)",
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start"
              }}
            >
              <div style={{ background: "#F1F5F9", padding: "8px", borderRadius: "50%" }}>
                {getIcon(notif.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: notif.is_read ? "var(--text-main)" : "var(--primary)" }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.4" }}>{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}