import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { Bus, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Login() {
  const [view, setView] = useState("login"); // 'login' | 'register' | 'forgot'
  const [formData, setFormData] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (view === "login") {
        await login(formData.email, formData.password);
        navigate("/");
      } else if (view === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { first_name: formData.firstName, last_name: formData.lastName, role: "passenger" }
          }
        });
        if (error) throw error;
        
        if (data.session) navigate("/");
        else setSuccessMsg("Success! Please check your email to confirm your account.");
      } else if (view === "forgot") {
        // ✅ TINUOD NGA FORGOT PASSWORD LOGIC
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMsg("Password reset link sent! Please check your email.");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white", padding: "2rem 1.5rem" }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: "2rem", marginTop: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <div style={{ background: "#10B981", color: "white", padding: "8px", borderRadius: "10px" }}>
            <Bus size={24} />
          </div>
          <h1 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-main)" }}>BusPass</h1>
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
          {view === "login" ? "Welcome Back" : view === "register" ? "Create Account" : "Reset Password"}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          {view === "login" ? "Sign in to search and secure your ticket." : view === "register" ? "Join us to start booking tickets." : "Enter your email to receive a reset link."}
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "0.75rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}
      
      {successMsg && (
        <div style={{ background: "#ECFDF5", color: "#065F46", padding: "0.75rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center" }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {view === "register" && (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <input type="text" name="firstName" placeholder="First Name" style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none", background: "#F8FAFC" }} required onChange={handleChange} />
            <input type="text" name="lastName" placeholder="Last Name" style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none", background: "#F8FAFC" }} required onChange={handleChange} />
          </div>
        )}
        
        <div style={{ position: "relative" }}>
          <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input 
            type="email" name="email" placeholder="Email Address" 
            style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none", background: "#F8FAFC" }} 
            required onChange={handleChange} 
          />
        </div>

        {view !== "forgot" && (
          <div style={{ position: "relative" }}>
            <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input 
              type={showPassword ? "text" : "password"} name="password" placeholder="Password" 
              style={{ width: "100%", padding: "1rem 3rem 1rem 3rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none", background: "#F8FAFC" }} 
              required onChange={handleChange} 
            />
            <button 
              type="button" onClick={() => setShowPassword(!showPassword)} 
              style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}

        {view === "login" && (
          <div style={{ textAlign: "right" }}>
            <button type="button" onClick={() => { setView("forgot"); setError(""); setSuccessMsg(""); }} style={{ background: "none", border: "none", color: "#10B981", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer" }}>
              Forgot Password?
            </button>
          </div>
        )}

        <button 
          type="submit" 
          style={{ background: "#10B981", color: "white", padding: "1rem", borderRadius: "12px", fontWeight: "700", border: "none", cursor: "pointer", marginTop: "0.5rem" }} 
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : view === "login" ? "Sign In" : view === "register" ? "Create Account" : "Send Reset Link"}
        </button>
      </form>

      {/* Back to Login kung naa sa Forgot Password view */}
      {view === "forgot" && (
        <button 
          onClick={() => { setView("login"); setError(""); setSuccessMsg(""); }} 
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "1rem", cursor: "pointer" }}
        >
          Back to Sign In
        </button>
      )}

      {/* Divider and Register Toggle - Tagoa kung naa sa Forgot view */}
      {view !== "forgot" && (
        <>
          <div style={{ display: "flex", alignItems: "center", margin: "2rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
            <span style={{ padding: "0 1rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>OR CONNECT WITH</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
          </div>

          <button 
            onClick={() => { setView(view === "login" ? "register" : "login"); setError(""); setSuccessMsg(""); }} 
            style={{ background: "white", color: "var(--text-main)", padding: "1rem", borderRadius: "12px", fontWeight: "700", border: "1px solid var(--border-color)", cursor: "pointer" }}
          >
            {view === "login" ? "Create an Account" : "Back to Sign In"}
          </button>
        </>
      )}
    </div>
  );
}