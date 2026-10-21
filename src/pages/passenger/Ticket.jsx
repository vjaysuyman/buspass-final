import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom"; // Gidugangan ang useSearchParams
import { ChevronLeft, Download, Info, CreditCard } from "lucide-react";
import QRCode from "qrcode";
import { passengerApi } from "../../services/passengerApi";
import { supabase } from "../../lib/supabaseClient"; // Gikinahanglan para sa update

export default function Ticket() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // <-- Kini ang mokuha sa "?payment=success"
  
  const [booking, setBooking] = useState(null);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    async function loadTicket() {
      try {
        let data = await passengerApi.getBookingById(bookingId);

        // ✅ KUNG GIKAN SA PAYMONGO UG PENDING PA, ATONG I-CONFIRM
        if (searchParams.get("payment") === "success" && data.status === "pending") {
          await supabase
            .from('bookings')
            .update({ status: 'confirmed', payment_status: 'paid' })
            .eq('id', bookingId);
            
          // I-reload ang data human ma-update
          data = await passengerApi.getBookingById(bookingId);
        }

        setBooking(data);

        // Generate QR only if NOT pending
        if (data.status !== "pending") {
          QRCode.toDataURL(data.reference, { width: 200, margin: 2 }, (err, url) => {
            if (!err) setQrUrl(url);
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadTicket();
  }, [bookingId, searchParams]);

  if (!booking) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading ticket...</div>;

  const types = booking.passenger_types || [];
  const regularCount = types.filter((t) => t === "regular").length;
  const discountedCount = types.filter((t) => t === "discounted").length;

  return (
    <div style={{ padding: "1rem", minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-color)" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem", gap: "1rem" }}>
        <button onClick={() => navigate("/passenger/home")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Your E-Ticket</h2>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* TICKET HEADER */}
        <div
          style={{
            background: booking.status === "pending" ? "#F59E0B" : "var(--primary)",
            color: "white",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.875rem", opacity: 0.8, marginBottom: "0.5rem" }}>Booking Reference</p>
          <h1 style={{ fontSize: "2rem", letterSpacing: "2px", fontWeight: "bold" }}>{booking.reference}</h1>
          <p
            style={{
              fontSize: "0.75rem",
              background: "rgba(255,255,255,0.2)",
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "16px",
              marginTop: "0.5rem",
              fontWeight: "600",
            }}
          >
            {booking.status === "pending" ? "PENDING PAYMENT" : booking.status.toUpperCase()}
          </p>
        </div>

        {/* QR CODE — hidden if pending */}
        {booking.status !== "pending" && (
          <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "1px dashed var(--border-color)" }}>
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code" style={{ width: "200px", height: "200px" }} />
            ) : (
              <div style={{ width: "200px", height: "200px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                Generating...
              </div>
            )}
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "1rem", textAlign: "center" }}>
              Show this QR code to the operator upon boarding.
            </p>
          </div>
        )}

        {/* PENDING NOTICE */}
        {booking.status === "pending" && (
          <div style={{ padding: "2rem", textAlign: "center", borderBottom: "1px dashed var(--border-color)", color: "var(--text-muted)" }}>
            <CreditCard size={48} style={{ opacity: 0.3, margin: "0 auto 1rem auto" }} />
            <p>Please complete your payment to generate the QR ticket.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
              onClick={() => navigate(`/passenger/payment/${booking.id}`)}
            >
              Complete Payment
            </button>
          </div>
        )}

        {/* TRIP DETAILS & RECEIPT */}
        <div style={{ padding: "1.5rem", flex: 1 }}>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.5rem" }}>Trip Details</p>
            <div style={{ background: "#F8FAFC", padding: "1rem", borderRadius: "8px", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-muted)" }}>Route</span>
                <span style={{ fontWeight: "600" }}>{booking.trips?.origin} to {booking.trips?.destination}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-muted)" }}>Date & Time</span>
                <span style={{ fontWeight: "600" }}>{booking.trips?.date} • {booking.trips?.departure_time}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Bus</span>
                <span style={{ fontWeight: "600" }}>{booking.trips?.bus_name}</span>
              </div>
            </div>
          </div>

          {/* RECEIPT BREAKDOWN */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.5rem" }}>Fare Breakdown</p>
            <div style={{ background: "#F8FAFC", padding: "1rem", borderRadius: "8px", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>Seats: <strong>{booking.seats.join(", ")}</strong></span>
              </div>
              
              {regularCount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "var(--text-muted)" }}>
                  <span>Regular Passenger (x{regularCount})</span>
                  <span>₱{regularCount * 200}</span>
                </div>
              )}
              
              {discountedCount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "var(--primary)" }}>
                  <span>Discounted (x{discountedCount})</span>
                  <span>₱{discountedCount * 160}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--border-color)", fontWeight: "bold", fontSize: "1.1rem" }}>
                <span>{booking.status === "pending" ? "Amount Due" : "Total Paid"}</span>
                <span style={{ color: "var(--primary)" }}>₱{booking.total_amount}</span>
              </div>
            </div>
          </div>

          {/* WARNING NOTE */}
          {discountedCount > 0 && (
            <div style={{ background: "#FEF3C7", color: "#92400E", padding: "0.75rem", borderRadius: "8px", fontSize: "0.75rem", display: "flex", gap: "6px", marginBottom: "1.5rem", border: "1px solid #FDE68A" }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>Please prepare a valid Student/PWD/Senior Citizen ID for verification upon boarding.</span>
            </div>
          )}

          <button
            className="btn"
            style={{ width: "100%", background: "white", border: "1px solid var(--border-color)", color: "var(--text-main)" }}
            onClick={() => window.print()}
          >
            <Download size={18} style={{ marginRight: "8px" }} /> Save / Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
}