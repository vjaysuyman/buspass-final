import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Wallet, ShieldCheck } from "lucide-react";
import { passengerApi } from "../../services/passengerApi";
import { supabase } from "../../lib/supabaseClient";

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      try {
        const data = await passengerApi.getBookingById(bookingId);
        setBooking(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  const handlePay = async () => {
    setIsProcessing(true);
    
    try {
      // 1. Kuhaa ang client_key gikan sa Supabase Edge Function
      const { client_key, payment_intent_id } = await passengerApi.createPaymentIntent(bookingId);

      const publicKey = import.meta.env.VITE_PAYMONGO_PUBLIC_KEY;
      if (!publicKey) throw new Error("PayMongo Public Key is missing in .env");

      // 2. Paghimo og Payment Method (GCash)
      const pmResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(publicKey + ':')}`,
        },
        body: JSON.stringify({
          data: { attributes: { type: 'gcash' } }
        })
      });
      
      const pmData = await pmResponse.json();
      
      // Kung naay error sa paghimo og Payment Method, i-show ang exact message
      if (!pmResponse.ok) {
        throw new Error("PayMongo Error: " + (pmData.errors?.[0]?.detail || JSON.stringify(pmData)));
      }
      
      const paymentMethodId = pmData.data.id;

      // 3. I-attach ang Payment Method sa Payment Intent
      const attachResponse = await fetch(`https://api.paymongo.com/v1/payment_intents/${payment_intent_id}/attach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(publicKey + ':')}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId,
              client_key: client_key,
              return_url: window.location.origin + `/passenger/ticket/${bookingId}?payment=success`
            }
          }
        })
      });
      
      const attachData = await attachResponse.json();
      
      if (!attachResponse.ok) {
        throw new Error("Attach Error: " + (attachData.errors?.[0]?.detail || JSON.stringify(attachData)));
      }

      // 4. I-redirect sa PayMongo GCash Checkout URL
      if (attachData.data?.attributes?.next_action?.redirect?.url) {
        window.location.href = attachData.data.attributes.next_action.redirect.url;
      } else {
        // Fallback kung wala nay redirect (pananglitan kung successful na)
        await supabase.from('bookings').update({ 
          status: 'confirmed', 
          payment_status: 'paid' 
        }).eq('id', bookingId);
        
        alert("Payment successful!");
        navigate(`/passenger/ticket/${bookingId}`);
      }

    } catch (error) {
      // Diri nimo makita ang exact nga rason ngano nag-fail
      console.error("Payment Error Details:", error);
      alert(error.message);
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading payment...</div>;
  if (!booking) return <div style={{ padding: "2rem", textAlign: "center" }}>Booking not found.</div>;

  return (
    <div style={{ padding: "1rem", paddingBottom: "100px", minHeight: "100vh", background: "var(--bg-color)" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem", gap: "1rem" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Payment</h2>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Amount to Pay</p>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary)", margin: "0.5rem 0" }}>
          ₱{booking.total_amount}
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Booking Ref: {booking.reference}</p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>Payment Method</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", border: "2px solid var(--primary)", borderRadius: "8px", background: "#F0FDF4" }}>
            <Wallet size={24} color="var(--primary)" />
            <div>
              <p style={{ fontWeight: "600" }}>GCash / Maya</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Pay via e-wallet</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "8px", opacity: 0.6 }}>
            <CreditCard size={24} color="var(--text-muted)" />
            <div>
              <p style={{ fontWeight: "600" }}>Credit / Debit Card</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: "70px", left: 0, right: 0, padding: "1rem", background: "white", borderTop: "1px solid var(--border-color)", zIndex: 10 }}>
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", marginBottom: "0.5rem" }}>
          <ShieldCheck size={14} /> Secured by PayMongo
        </p>
        <button className="btn btn-primary" style={{ width: "100%", padding: "1rem" }} onClick={handlePay} disabled={isProcessing}>
          {isProcessing ? "Processing..." : `Pay ₱${booking.total_amount}`}
        </button>
      </div>
    </div>
  );
}