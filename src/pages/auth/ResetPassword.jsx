import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", background: "var(--bg-color)" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
        
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>Reset Password</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>Enter your new password below.</p>
        </div>

        {error && <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem", display: "flex", gap: "6px" }}><AlertCircle size={16}/>{error}</div>}
        
        {success && (
          <div style={{ background: "#ECFDF5", color: "#065F46", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <CheckCircle2 size={40} style={{ margin: "0 auto 1rem auto", color: "#10B981" }} />
            <h3 style={{ fontWeight: "700", marginBottom: "0.5rem" }}>Password Updated!</h3>
            <p style={{ fontSize: "0.85rem" }}>Redirecting to login...</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input 
                type="password" 
                placeholder="New Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none", background: "#F8FAFC" }} 
                required 
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: "100%" }}>
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}