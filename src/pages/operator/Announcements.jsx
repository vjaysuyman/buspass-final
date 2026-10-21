import { useState, useEffect } from "react";
import { Plus, Trash2, X, Megaphone } from "lucide-react";
import { announcementApi } from "../../services/announcementApi";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info"
  });

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await announcementApi.getAll();
      setAnnouncements(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await announcementApi.create(formData);
      setIsModalOpen(false);
      setFormData({ title: "", content: "", type: "info" });
      loadAnnouncements();
    } catch (error) {
      alert("Failed to post announcement.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await announcementApi.delete(id);
      loadAnnouncements();
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case "warning": return { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" };
      case "success": return { bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" };
      default: return { bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" };
    }
  };

  return (
    <div className="animate-slide-up" style={{ paddingBottom: "90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Announcements</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Broadcast important updates to passengers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: "0.6rem 1rem" }}>
          <Plus size={18} style={{ marginRight: "6px" }} /> New Post
        </button>
      </div>

      {isLoading ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <Megaphone size={48} style={{ opacity: 0.2, margin: "0 auto 1rem auto" }} />
          <h3>No announcements yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Post an update to let passengers know.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "800px" }}>
          {announcements.map(ann => {
            const styles = getTypeStyles(ann.type);
            return (
              <div key={ann.id} className="card" style={{ borderLeft: `4px solid ${styles.border}`, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ background: styles.bg, color: styles.color, padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase" }}>
                      {ann.type}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(ann.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}>
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem" }}>{ann.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.5" }}>{ann.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div style={{ 
          position: "fixed", 
          inset: 0, 
          background: "rgba(15, 23, 42, 0.6)", 
          backdropFilter: "blur(4px)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          zIndex: 50, 
          padding: "1rem",
          paddingBottom: "90px" // Aron dili matabunan sa bottom nav
        }}>
          <div className="card animate-slide-up" style={{ 
            width: "100%", 
            maxWidth: "500px", 
            background: "white", 
            padding: 0,
            maxHeight: "90vh", // Limitasyon sa gitas-on
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Post Announcement</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "#F1F5F9", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {/* Scrollable Form Area */}
            <div style={{ padding: "1.5rem", overflowY: "auto" }}>
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Title</label>
                  <input className="input-field" placeholder="e.g. Schedule Change for Tomorrow" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Type</label>
                  <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="success">Success (Green)</option>
                  </select>
                </div>
                
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Message Content</label>
                  <textarea className="input-field" rows="4" placeholder="Write your announcement here..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required style={{ resize: "vertical" }} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>Publish Announcement</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}