import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Ticket as TicketIcon, MapPin } from "lucide-react";
import { passengerApi } from "../../services/passengerApi";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await passengerApi.getMyBookings();
        setBookings(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBookings();
  }, []);

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading bookings...</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "var(--text-main)" }}>My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <TicketIcon size={48} style={{ color: "var(--text-muted)", opacity: 0.3, margin: "0 auto 1rem auto" }} />
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No bookings yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Your upcoming trips will appear here.</p>
          <button className="btn btn-primary" onClick={() => navigate("/passenger/home")}>Book a Trip</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {bookings.map((booking) => (
            <div key={booking.id} className="card" style={{ padding: "1rem" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Reference</p>
                  <p style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--primary)" }}>{booking.reference}</p>
                </div>
                <span style={{ 
                  background: booking.status === "confirmed" ? "#D1FAE5" : booking.status === "pending" ? "#FEF3C7" : "#FEE2E2",
                  color: booking.status === "confirmed" ? "#065F46" : booking.status === "pending" ? "#92400E" : "#991B1B",
                  padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase"
                }}>
                  {booking.status}
                </span>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ background: "#F1F5F9", padding: "10px", borderRadius: "8px" }}>
                  <MapPin size={20} color="var(--text-muted)" />
                </div>
                <div>
                  <p style={{ fontWeight: "600" }}>{booking.trips?.origin} to {booking.trips?.destination}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>Seats: {booking.seats.join(", ")}</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Amount</p>
                  <p style={{ fontWeight: "700", fontSize: "1.1rem" }}>₱{booking.total_amount}</p>
                </div>
                <button className="btn" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", background: "#F1F5F9", color: "var(--text-main)" }} onClick={() => navigate(`/passenger/ticket/${booking.id}`)}>
                  View Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}