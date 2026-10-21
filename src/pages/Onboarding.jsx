import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "white", padding: "2rem 1.5rem" }}>
      
      {/* Image Area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem" }}>
        <img 
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Bus Travel" 
          style={{ width: "100%", maxWidth: "350px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
        />
      </div>

      {/* Text Area */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "0.5rem" }}>Travel with Ease</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>
          Book routes between Iligan City and Cagayan de Oro effortlessly. Secure seats, track rides, and travel in style.
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button 
          onClick={() => navigate("/login")} 
          style={{ background: "#10B981", color: "white", padding: "1rem", borderRadius: "12px", fontWeight: "700", border: "none", cursor: "pointer" }}
        >
          Get Started
        </button>
        <button 
          onClick={() => navigate("/login")} 
          style={{ background: "white", color: "var(--text-main)", padding: "1rem", borderRadius: "12px", fontWeight: "700", border: "1px solid var(--border-color)", cursor: "pointer" }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}