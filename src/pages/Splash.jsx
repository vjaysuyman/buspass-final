import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bus } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2000); // 2 segundos
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ 
      height: "100vh", 
      background: "#10B981", // Emerald Green base sa imong picture
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      color: "white"
    }}>
      <div style={{ 
        background: "white", 
        width: "80px", height: "80px", 
        borderRadius: "24px", 
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "1.5rem",
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
      }}>
        <Bus size={40} color="#10B981" />
      </div>
      <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.5px" }}>BusPass</h1>
      <p style={{ fontSize: "0.9rem", opacity: 0.9, marginTop: "0.5rem", letterSpacing: "1px" }}>YOUR RIDE, YOUR WAY</p>
    </div>
  );
}