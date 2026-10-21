import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket as TicketIcon, QrCode } from "lucide-react";
import { passengerApi } from "../../services/passengerApi";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTickets() {
      try {
        const bookings = await passengerApi.getMyBookings();
        // Filter out cancelled bookings — show confirmed, boarded, and pending
        const activeTickets = bookings.filter(
          (b) => b.status === "confirmed" || b.status === "boarded" || b.status === "pending"
        );
        setTickets(activeTickets);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTickets();
  }, []);

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading tickets...</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "var(--text-main)" }}>My Tickets</h2>

      {tickets.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <QrCode size={48} style={{ color: "var(--text-muted)", opacity: 0.3, margin: "0 auto 1rem auto" }} />
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No active tickets</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Confirmed bookings will show their QR codes here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="card"
              style={{ padding: 0, overflow: "hidden", display: "flex", cursor: "pointer" }}
              onClick={() => navigate(`/passenger/ticket/${ticket.id}`)}
            >
              {/* Left color bar */}
              <div
                style={{
                  background:
                    ticket.status === "boarded"
                      ? "#64748B"
                      : ticket.status === "pending"
                      ? "#F59E0B"
                      : "var(--primary)",
                  width: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <TicketIcon size={32} />
              </div>

              {/* Details */}
              <div style={{ flex: 1, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--primary)", marginBottom: "4px" }}>
                    {ticket.reference}
                  </p>
                  <p style={{ fontWeight: "600", color: "var(--text-main)" }}>
                    {ticket.trips?.origin} to {ticket.trips?.destination}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Seats: {ticket.seats.join(", ")}
                  </p>
                </div>

                {/* Status badge */}
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      background:
                        ticket.status === "boarded"
                          ? "#E2E8F0"
                          : ticket.status === "pending"
                          ? "#FEF3C7"
                          : "#D1FAE5",
                      color:
                        ticket.status === "boarded"
                          ? "#475569"
                          : ticket.status === "pending"
                          ? "#92400E"
                          : "#065F46",
                      padding: "4px 8px",
                      borderRadius: "8px",
                    }}
                  >
                    {ticket.status === "boarded"
                      ? "USED"
                      : ticket.status === "pending"
                      ? "PENDING"
                      : "VALID"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}