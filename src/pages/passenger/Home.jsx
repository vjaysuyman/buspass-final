import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Search, ArrowRight, Clock, Megaphone } from "lucide-react";
import { passengerApi } from "../../services/passengerApi";
import { announcementApi } from "../../services/announcementApi";

export default function Home() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [trips, setTrips] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await announcementApi.getAll();
        setLatestAnnouncements(data?.slice(0, 2) || []); // 2 ra ka pinakabag-o
      } catch (error) {
        console.error(error);
      }
    }
    loadAnnouncements();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await passengerApi.searchTrips(date);
      setTrips(results);
    } catch (error) {
      console.error("Failed to search trips", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", paddingTop: "1.5rem" }}>
      {/* ANNOUNCEMENTS BANNER */}
      {latestAnnouncements.length > 0 && (
        <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {latestAnnouncements.map(ann => (
            <div key={ann.id} style={{ background: ann.type === 'warning' ? '#FEF3C7' : ann.type === 'success' ? '#D1FAE5' : '#DBEAFE', padding: "0.75rem 1rem", borderRadius: "8px", display: "flex", gap: "10px", alignItems: "flex-start", borderLeft: `4px solid ${ann.type === 'warning' ? '#FDE68A' : ann.type === 'success' ? '#A7F3D0' : '#BFDBFE'}` }}>
              <Megaphone size={18} style={{ color: ann.type === 'warning' ? '#92400E' : ann.type === 'success' ? '#065F46' : '#1E40AF', flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p style={{ fontWeight: "700", fontSize: "0.85rem", color: ann.type === 'warning' ? '#92400E' : ann.type === 'success' ? '#065F46' : '#1E40AF' }}>{ann.title}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-main)", marginTop: "2px" }}>{ann.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-main)" }}>Where to?</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Book your bus trip easily.</p>
      </div>

      <div className="card" style={{ marginBottom: "2rem", position: "relative", zIndex: 2 }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#F8FAFC", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <div style={{ background: "#E2E8F0", padding: "6px", borderRadius: "50%" }}><MapPin size={18} color="var(--text-muted)" /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Origin</p>
                <p style={{ fontWeight: "600", color: "var(--text-main)" }}>Iligan City</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#F8FAFC", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <div style={{ background: "#ccfbf1", padding: "6px", borderRadius: "50%" }}><MapPin size={18} color="var(--primary)" /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Destination</p>
                <p style={{ fontWeight: "600", color: "var(--text-main)" }}>Cagayan de Oro City</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Travel Date</label>
              <div style={{ position: "relative" }}>
                <Calendar size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input type="date" className="input-field" style={{ width: "100%", paddingLeft: "2.5rem", fontWeight: "600" }} value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={isLoading}>
            <Search size={18} style={{ marginRight: "8px" }} />
            {isLoading ? "Searching..." : "Search Available Trips"}
          </button>
        </form>
      </div>

      {hasSearched && (
        <div className="animate-slide-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>Available Trips</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{trips.length} results</span>
          </div>
          
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Finding the best trips for you...</div>
          ) : trips.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
              <Calendar size={48} style={{ margin: "0 auto", opacity: 0.2, marginBottom: "1rem" }} />
              <p>No trips found for this date.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {trips.map((trip) => (
                <div key={trip.id} className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }} onClick={() => navigate(`/passenger/book/${trip.id}`)}>
                  <div style={{ padding: "1rem", borderBottom: "1px dashed var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--primary)", background: "#ccfbf1", padding: "2px 8px", borderRadius: "12px", display: "inline-block", marginBottom: "0.5rem" }}>{trip.bus_name}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <h4 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{trip.departure_time}</h4>
                          <ArrowRight size={16} color="var(--text-muted)" />
                          <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-muted)" }}>{trip.arrival_time}</h4>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Fare</p>
                        <p style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--primary)" }}>₱{trip.fare}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "1rem", background: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      <Clock size={16} /> <span>{trip.available_seats} seats left</span>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px" }}>Select <ArrowRight size={16} /></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}