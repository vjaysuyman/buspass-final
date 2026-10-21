import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield, LogOut, Camera } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, logout, uploadAvatar } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsSaving(true);
        await uploadAvatar(file);
      } catch (error) {
        alert("Failed to upload image: " + error.message);
      } finally {
        setIsSaving(false);
        e.target.value = ""; // Reset aron makabalik-upload sa parehong file
      }
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "var(--text-main)" }}>Profile Settings</h2>

      <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Avatar with upload overlay */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="avatar"
              style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid #ccfbf1" }}
            />
          ) : (
            <div style={{ background: "#ccfbf1", color: "var(--primary)", padding: "1rem", borderRadius: "50%", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={32} />
            </div>
          )}

          {/* Camera button */}
          <label
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              background: "var(--primary)",
              color: "white",
              borderRadius: "50%",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isSaving ? "wait" : "pointer",
              opacity: isSaving ? 0.6 : 1,
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            <Camera size={14} />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSaving}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>{user?.first_name} {user?.last_name}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "capitalize" }}>{user?.role}</p>
          {isSaving && <p style={{ color: "var(--primary)", fontSize: "0.75rem", marginTop: "2px" }}>Uploading...</p>}
        </div>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
          <Mail size={20} color="var(--text-muted)" />
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Email Address</p>
            <p style={{ fontWeight: "500" }}>{user?.email}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem" }}>
          <Shield size={20} color="var(--text-muted)" />
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Account Type</p>
            <p style={{ fontWeight: "500", textTransform: "capitalize" }}>{user?.role}</p>
          </div>
        </div>
      </div>

      <button className="btn" onClick={handleLogout} style={{ width: "100%", background: "#FEE2E2", color: "#B91C1C" }}>
        <LogOut size={18} style={{ marginRight: "8px" }} /> Log Out
      </button>
    </div>
  );
}