import { useState, useEffect, useRef } from "react";
import { ScanLine, CheckCircle2, XCircle, Camera, Keyboard, QrCode } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "../../lib/supabaseClient";

export default function Scanner() {
  const [ticketRef, setTicketRef] = useState("");
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeTab, setActiveTab] = useState("camera"); // 'camera' | 'manual'
  
  const scannerRef = useRef(null);

  // Function para mo-verify sa ticket
  const verifyTicket = async (reference) => {
    setIsScanning(true);
    setResult(null);

    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*, trips(bus_name, departure_time)') // Kuhaon pud ang trip details
        .eq('reference', reference.toUpperCase())
        .single();

      if (error || !booking) {
        setResult({ success: false, message: "Invalid Ticket Reference" });
      } else if (booking.status === 'cancelled') {
        setResult({ success: false, message: "Ticket is Cancelled" });
      } else if (booking.status === 'boarded') {
        setResult({ success: false, message: "Ticket Already Used" });
      } else if (booking.status === 'confirmed') {
        await supabase.from('bookings').update({ status: 'boarded' }).eq('id', booking.id);
        setResult({ success: true, message: "Verified Successfully!", booking });
      } else {
        setResult({ success: false, message: "Ticket is not paid/confirmed" });
      }
    } catch (err) {
      setResult({ success: false, message: "System Error" });
    } finally {
      setIsScanning(false);
      setTicketRef(""); 
    }
  };

  const handleManualScan = (e) => {
    e.preventDefault();
    if (!ticketRef) return;
    verifyTicket(ticketRef);
  };

  // Setup Camera Scanner
  useEffect(() => {
    if (!isCameraActive) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    if (isCameraActive && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setIsCameraActive(false);
          scannerRef.current = null;
          verifyTicket(decodedText);
        },
        (error) => {}
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isCameraActive]);

  return (
    <div className="animate-slide-up" style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "90px" }}>
      
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>QR Ticket Scanner</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Scan passenger tickets or enter reference manually.</p>
      </div>

      {/* RESULT DISPLAY */}
      {result && (
        <div className="animate-slide-up" style={{ 
          background: result.success ? "#ECFDF5" : "#FEF2F2", 
          border: `1px solid ${result.success ? "#10B981" : "#EF4444"}`,
          padding: "1.5rem", borderRadius: "12px", textAlign: "center", marginBottom: "1.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}>
          {result.success ? <CheckCircle2 size={48} style={{ color: "#10B981", margin: "0 auto 1rem auto" }} /> : <XCircle size={48} style={{ color: "#EF4444", margin: "0 auto 1rem auto" }} />}
          
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: result.success ? "#047857" : "#B91C1C" }}>
            {result.message}
          </h3>

          {result.success && result.booking && (
            <div style={{ marginTop: "1rem", background: "white", padding: "1rem", borderRadius: "8px", textAlign: "left", fontSize: "0.85rem" }}>
              <p style={{ marginBottom: "4px" }}><strong>Reference:</strong> {result.booking.reference}</p>
              <p style={{ marginBottom: "4px" }}><strong>Seats:</strong> {result.booking.seats.join(", ")}</p>
              <p><strong>Trip:</strong> {result.booking.trips?.bus_name} ({result.booking.trips?.departure_time})</p>
            </div>
          )}
        </div>
      )}

      {/* TABS */}
      <div style={{ display: "flex", background: "#E2E8F0", padding: "4px", borderRadius: "12px", marginBottom: "1.5rem" }}>
        <button 
          onClick={() => { setActiveTab("camera"); setIsCameraActive(true); }} 
          style={{ flex: 1, padding: "0.75rem", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", background: activeTab === "camera" ? "white" : "transparent", color: activeTab === "camera" ? "var(--primary)" : "var(--text-muted)", boxShadow: activeTab === "camera" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
        >
          <Camera size={18} /> Camera
        </button>
        <button 
          onClick={() => { setActiveTab("manual"); setIsCameraActive(false); }} 
          style={{ flex: 1, padding: "0.75rem", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", background: activeTab === "manual" ? "white" : "transparent", color: activeTab === "manual" ? "var(--primary)" : "var(--text-muted)", boxShadow: activeTab === "manual" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
        >
          <Keyboard size={18} /> Manual
        </button>
      </div>

      {/* CAMERA TAB */}
      {activeTab === "camera" && (
        <div className="card" style={{ padding: "1.5rem", minHeight: "350px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {isCameraActive ? (
            <div className="animate-slide-up">
              <div id="reader" style={{ width: "100%", borderRadius: "12px", overflow: "hidden", border: "2px solid var(--primary)" }}></div>
              <button 
                onClick={() => setIsCameraActive(false)}
                className="btn" 
                style={{ width: "100%", marginTop: "1rem", background: "#FEE2E2", color: "#B91C1C" }}
              >
                Cancel Scan
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ background: "#F0FDF4", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto" }}>
                <QrCode size={40} style={{ color: "var(--primary)" }} />
              </div>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: "700" }}>Scan Passenger QR</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>
                Align the QR code within the frame to verify the ticket.
              </p>
              <button 
                onClick={() => setIsCameraActive(true)} 
                className="btn btn-primary" 
                style={{ width: "100%", maxWidth: "300px" }}
              >
                Open Camera
              </button>
            </div>
          )}
        </div>
      )}

      {/* MANUAL TAB */}
      {activeTab === "manual" && (
        <div className="card animate-slide-up" style={{ padding: "2rem 1.5rem", textAlign: "center", minHeight: "350px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ background: "#F1F5F9", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto" }}>
            <Keyboard size={40} style={{ color: "var(--text-muted)" }} />
          </div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: "700" }}>Manual Verification</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>
            Enter the booking reference printed on the ticket.
          </p>
          <form onSubmit={handleManualScan} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px", margin: "0 auto", width: "100%" }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="BP-A1B2C3"
              value={ticketRef}
              onChange={(e) => setTicketRef(e.target.value)}
              style={{ textTransform: "uppercase", textAlign: "center", fontSize: "1.2rem", letterSpacing: "2px", fontWeight: "700" }}
            />
            <button type="submit" className="btn btn-primary" disabled={isScanning} style={{ width: "100%" }}>
              {isScanning ? "Verifying..." : "Verify Ticket"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}