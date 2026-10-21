import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, XCircle, Info } from "lucide-react";
import { passengerApi } from "../../services/passengerApi";

export default function SeatSelection() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerTypes, setPassengerTypes] = useState({});
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  const REGULAR_FARE = 200;
  const DISCOUNTED_FARE = 160;

  useEffect(() => {
    async function fetchData() {
      try {
        const tripData = await passengerApi.getTripById(tripId);
        setTrip(tripData);

        const booked = await passengerApi.getBookedSeats(tripId);
        setBookedSeats(booked); 
        
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [tripId]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
      const newTypes = { ...passengerTypes };
      delete newTypes[seatId];
      setPassengerTypes(newTypes);
    } else {
      if (selectedSeats.length >= 5) {
        alert("Maximum of 5 seats per booking.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
      setPassengerTypes({ ...passengerTypes, [seatId]: "regular" });
    }
  };

  const handleTypeChange = (seatId, type) => {
    setPassengerTypes({ ...passengerTypes, [seatId]: type });
  };

  const calculateTotal = () => {
    let total = 0;
    selectedSeats.forEach(seat => {
      if (passengerTypes[seat] === "discounted") total += DISCOUNTED_FARE;
      else total += REGULAR_FARE;
    });
    return total;
  };

  const handleProceed = async () => {
    if (selectedSeats.length === 0) return;
    setIsBooking(true);
    
    try {
      const isAvailable = await passengerApi.checkSeatsAvailable(trip.id, selectedSeats);
      
      if (!isAvailable) {
        alert("Sorry, some of the seats you selected have already been booked. Please choose different seats.");
        const updatedBooked = await passengerApi.getBookedSeats(trip.id);
        setBookedSeats(updatedBooked);
        setSelectedSeats([]);
        setPassengerTypes({});
        setIsBooking(false);
        return;
      }

      const newBooking = await passengerApi.createBooking({
        trip_id: trip.id,
        seats: selectedSeats,
        passenger_types: Object.values(passengerTypes),
        total_amount: calculateTotal(),
      });
      
      navigate(`/passenger/payment/${newBooking.id}`);
      
    } catch (error) {
      alert("Booking failed: " + error.message);
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading layout...</div>;
  if (!trip) return <div style={{ padding: "2rem", textAlign: "center" }}>Trip not found.</div>;

  // ✅ DINHI NATO KWAON ANG KAPASIDAD GIKAN SA DATABASE
  const totalSeats = trip.total_seats || 16; 
  const seatsPerRow = 4;
  const totalRows = Math.ceil(totalSeats / seatsPerRow); // I-round up kung dili divisible by 4

  return (
    <div style={{ paddingBottom: "120px", background: "#F8FAFC", minHeight: "100vh" }}>
      
      {/* Header */}
      <div style={{ padding: "1.5rem 1rem 1rem 1rem", background: "white", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <button onClick={() => navigate(-1)} style={{ background: "white", border: "1px solid var(--border-color)", padding: "8px", borderRadius: "10px", cursor: "pointer" }}><ChevronLeft size={20} /></button>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "2px" }}>Select Your Seat</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{trip.bus_name} • {trip.departure_time} Route</p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ background: "white", padding: "0 1rem 1rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><div style={{ width: "24px", height: "24px", background: "#ECFDF5", border: "1px solid #34D399", borderRadius: "6px" }}></div> Available</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><div style={{ width: "24px", height: "24px", background: "#2563EB", border: "1px solid #2563EB", borderRadius: "6px" }}></div> Selected</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><div style={{ width: "24px", height: "24px", background: "#E2E8F0", border: "1px solid #CBD5E1", borderRadius: "6px" }}></div> Booked</div>
        </div>
      </div>

      {/* Bus Layout */}
      <div style={{ padding: "2rem 1rem" }}>
        <div style={{ background: "white", borderRadius: "24px", padding: "1.5rem", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", maxWidth: "400px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px dashed var(--border-color)" }}>
            <XCircle size={24} color="#94A3B8" />
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94A3B8", letterSpacing: "1px" }}>FRONT</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", justifyItems: "center" }}>
            {/* ✅ DYNAMIC NGA PAG-GENERATE SA SEATS BASE SA totalSeats */}
            {Array.from({ length: totalRows }).map((_, rowIndex) => {
              return [1, 2, 3, 4].map((colIndex) => {
                const rowNum = rowIndex + 1;
                const colLetter = ["A", "B", "C", "D"][colIndex - 1];
                const seatId = `${rowNum}${colLetter}`;
                
                // Check kung lapas na sa totalSeats (e.g., 39 seats, ang last row kay 3 ra ka seats)
                const seatNumber = (rowNum - 1) * 4 + colIndex;
                if (seatNumber > totalSeats) return null;

                const isBooked = bookedSeats.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const isAisle = colIndex === 2;

                let bgColor = "#ECFDF5"; let borderColor = "#34D399"; let textColor = "#047857";
                if (isBooked) { bgColor = "#E2E8F0"; borderColor = "#CBD5E1"; textColor = "#64748B"; } 
                else if (isSelected) { bgColor = "#2563EB"; borderColor = "#2563EB"; textColor = "white"; }

                return (
                  <button key={seatId} onClick={() => toggleSeat(seatId)} disabled={isBooked} style={{
                      width: "100%", maxWidth: "50px", aspectRatio: "1", borderRadius: "10px",
                      border: `1px solid ${borderColor}`, background: bgColor, color: textColor,
                      cursor: isBooked ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "0.85rem", fontWeight: "700",
                      marginRight: isAisle ? "1.5rem" : "0", transition: "all 0.2s"
                    }}>
                    {seatId}
                  </button>
                );
              });
            })}
          </div>
        </div>
      </div>

      {/* Passenger Type Section */}
      {selectedSeats.length > 0 && (
        <div style={{ padding: "0 1rem 1rem 1rem" }}>
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <Info size={18} color="var(--primary)" /> Passenger Types & Fares
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {selectedSeats.map(seat => (
                <div key={seat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontWeight: "700", color: "var(--primary)" }}>Seat {seat}</span>
                  
                  <select 
                    className="input-field" 
                    style={{ width: "auto", padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                    value={passengerTypes[seat] || "regular"}
                    onChange={(e) => handleTypeChange(seat, e.target.value)}
                  >
                    <option value="regular">Regular (₱200)</option>
                    <option value="discounted">Student/PWD/Senior (₱160)</option>
                  </select>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed var(--border-color)", fontSize: "0.75rem", color: "#B45309", display: "flex", gap: "6px" }}>
              <Info size={16} style={{ flexShrink: 0 }}/>
              <span>Note: Passengers with discounted fares must present a valid ID to the operator before boarding.</span>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Summary */}
      <div style={{ position: "fixed", bottom: "70px", left: 0, right: 0, background: "white", padding: "1rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, boxShadow: "0 -4px 10px rgba(0,0,0,0.03)" }}>
        <div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Selected ({selectedSeats.length})</p>
          <p style={{ fontWeight: "800", fontSize: "1.3rem", color: "var(--primary)" }}>₱{calculateTotal()}</p>
        </div>
        <button className="btn btn-primary" style={{ padding: "0.8rem 1.5rem", borderRadius: "12px" }} disabled={selectedSeats.length === 0 || isBooking} onClick={handleProceed}>
          {isBooking ? "Processing..." : "Continue"}
        </button>
      </div>
    </div>
  );
}