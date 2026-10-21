import { useState, useEffect } from "react";
import { Plus, Clock, MapPin, X, Bus, Calendar as CalendarIcon, Armchair, Search, AlertCircle, Edit, Trash2, AlertTriangle } from "lucide-react";
import { operatorApi } from "../../services/operatorApi";

export default function Schedules() {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    busId: "",
    date: new Date().toISOString().split("T")[0],
    departureTime: "08:00 AM",
    arrivalTime: "10:00 AM",
    fare: 200
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tripsData, busesData] = await Promise.all([
        operatorApi.getTrips(),
        operatorApi.getBuses()
      ]);
      
      const today = new Date().toISOString().split("T")[0];
      
      // ✅ I-mark as completed ang mga nilabay nga trips
      const processedTrips = (tripsData || []).map(trip => {
        if (trip.date < today && trip.status === 'published') {
          return { ...trip, status: 'completed' };
        }
        return trip;
      });

      // ✅ Filter out cancelled trips, then sort newest first
      const activeAndCompletedTrips = processedTrips
        .filter(t => t.status !== 'cancelled')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTrips(activeAndCompletedTrips);
      setBuses(busesData || []);
      
      if (busesData && busesData.length > 0 && !formData.busId) {
        setFormData(prev => ({ ...prev, busId: busesData[0].id }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setErrorMsg("Failed to load schedules or buses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedTripId(null);
    setFormData({
      busId: buses[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      departureTime: "08:00 AM",
      arrivalTime: "10:00 AM",
      fare: 200
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trip) => {
    const matchedBus = buses.find(b => b.bus_name === trip.bus_name);
    
    setIsEditMode(true);
    setSelectedTripId(trip.id);
    setFormData({
      busId: matchedBus ? matchedBus.id : buses[0]?.id || "",
      date: trip.date,
      departureTime: trip.departure_time,
      arrivalTime: trip.arrival_time,
      fare: trip.fare
    });
    setIsModalOpen(true);
  };

  const handleSaveTrip = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    const selectedBus = buses.find(b => b.id === formData.busId);
    if (!selectedBus) {
      setErrorMsg("Please select a valid bus.");
      return;
    }

    const tripPayload = {
      bus_name: selectedBus.bus_name,
      total_seats: selectedBus.capacity,
      available_seats: selectedBus.capacity,
      date: formData.date,
      departure_time: formData.departureTime,
      arrival_time: formData.arrivalTime,
      fare: formData.fare,
      origin: "Iligan City",
      destination: "Cagayan de Oro City",
    };

    try {
      if (isEditMode) {
        await operatorApi.updateTrip(selectedTripId, tripPayload);
      } else {
        await operatorApi.createTrip(tripPayload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      setErrorMsg(`Failed to ${isEditMode ? "update" : "publish"} trip.`);
      console.error(error);
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    
    try {
      if (tripToDelete.status === 'completed') {
        // ✅ PERMANENT DELETE: Kung completed na ang trip, pwede na i-delete sa database
        // (Pero siguroha nga walay mga bookings nga naka-link ani, o else ma-cascade delete)
        await operatorApi.deleteTrip(tripToDelete.id);
      } else {
        // ✅ SOFT DELETE: Kung upcoming/active pa, i-cancel lang nato (dili i-delete sa DB)
        // Kini nagpabilin sa mga bookings ug history sa pasahero
        await operatorApi.updateTrip(tripToDelete.id, { status: 'cancelled' });
      }
      
      setIsDeleteModalOpen(false);
      setTripToDelete(null);
      loadData();
    } catch (error) {
      console.error(error);
      
      // Custom error message kung naay foreign key constraint (kay naay bookings)
      if (error.code === '23503') { 
        alert("Dili ni ma-delete kay naa ni existing bookings. I-cancel lang ni nga trip.");
      } else {
        alert("Failed to delete/cancel trip.");
      }
    }
  };

  const filteredTrips = trips.filter(trip => 
    trip.bus_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.date.includes(searchQuery)
  );

  // ✅ I-split ang Active ug Completed trips
  const activeTrips = filteredTrips.filter(t => t.status === 'published');
  const completedTrips = filteredTrips.filter(t => t.status === 'completed');

  // Reusable Trip Card Component
  const TripCard = ({ trip }) => (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", opacity: trip.status === 'completed' ? 0.85 : 1 }}>
      
      {/* STATUS BADGE */}
      <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 2 }}>
        <span style={{ 
          background: trip.status === 'completed' ? "#E2E8F0" : "#DCFCE7", 
          color: trip.status === 'completed' ? "#475569" : "#166534", 
          padding: "4px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase"
        }}>
          {trip.status}
        </span>
      </div>

      {/* ACTION BUTTONS SA TAAS SA CARD */}
      <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", gap: "0.5rem", zIndex: 2 }}>
        <button onClick={() => openEditModal(trip)} style={{ background: "white", border: "1px solid var(--border-color)", padding: "6px", borderRadius: "6px", cursor: "pointer", color: "var(--primary)", display: "flex" }}>
          <Edit size={16} />
        </button>
        <button onClick={() => { setTripToDelete(trip); setIsDeleteModalOpen(true); }} style={{ background: "white", border: "1px solid var(--border-color)", padding: "6px", borderRadius: "6px", cursor: "pointer", color: "#EF4444", display: "flex" }}>
          <Trash2 size={16} />
        </button>
      </div>

      <div style={{ padding: "1.25rem", borderBottom: "1px dashed var(--border-color)", background: "#F8FAFC", paddingTop: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: trip.status === 'completed' ? "#94A3B8" : "var(--primary)", color: "white", padding: "8px", borderRadius: "8px" }}>
              <Bus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>{trip.bus_name}</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>ID: {trip.id.split("-")[0]}</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: trip.status === 'completed' ? "var(--text-muted)" : "var(--primary)", fontSize: "0.85rem", fontWeight: "600" }}>
          <CalendarIcon size={16} /> {trip.date}
        </div>
      </div>

      <div style={{ padding: "1.25rem", flex: 1 }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Route</p>
            <p style={{ fontWeight: "600", fontSize: "0.95rem", marginTop: "2px" }}>Iligan <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>to</span> CDO</p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Time</p>
            <p style={{ fontWeight: "600", fontSize: "0.95rem", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={14} color="var(--text-muted)" /> {trip.departure_time}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "1rem 1.25rem", background: "#F8FAFC", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
          <Armchair size={16} /> {trip.total_seats} Seats
        </div>
        <div style={{ fontSize: "1.2rem", fontWeight: "800", color: trip.status === 'completed' ? "var(--text-muted)" : "var(--primary)" }}>
          ₱{trip.fare}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "90px" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-main)" }}>Trip Schedules</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>Manage and publish your bus departures.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={openCreateModal} 
          style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-md)" }}
        >
          <Plus size={18} /> Create New Trip
        </button>
      </div>

      {errorMsg && (
        <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      <div style={{ marginBottom: "1.5rem", position: "relative", maxWidth: "400px" }}>
        <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input 
          type="text" className="input-field" placeholder="Search by bus name or date..." 
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", paddingLeft: "2.5rem", background: "white" }}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading schedules...</div>
      ) : filteredTrips.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
          <CalendarIcon size={48} style={{ opacity: 0.2, margin: "0 auto 1rem auto" }} />
          <h3 style={{ fontSize: "1.1rem", color: "var(--text-main)", marginBottom: "0.5rem" }}>No trips found</h3>
          <p>Try adjusting your search or create a new trip.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          
          {/* ACTIVE TRIPS SECTION */}
          {activeTrips.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                Active Trips <span style={{ fontSize: "0.85rem", background: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: "10px" }}>{activeTrips.length}</span>
              </h2>
              <div className="responsive-grid">
                {activeTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
              </div>
            </div>
          )}

          {/* COMPLETED TRIPS SECTION */}
          {completedTrips.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
                Completed Trips <span style={{ fontSize: "0.85rem", background: "#E2E8F0", color: "#475569", padding: "2px 8px", borderRadius: "10px" }}>{completedTrips.length}</span>
              </h2>
              <div className="responsive-grid">
                {completedTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
              </div>
            </div>
          )}

        </div>
      )}

      {/* CREATE / EDIT TRIP MODAL */}
      {isModalOpen && (
        <div style={{ 
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", 
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem", paddingBottom: "90px" 
        }}>
          <div className="card animate-slide-up" style={{ width: "100%", maxWidth: "480px", background: "white", padding: 0, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{isEditMode ? "Edit Trip" : "Publish New Trip"}</h2>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>{isEditMode ? "Update schedule details." : "Fill in the schedule details below."}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "#F1F5F9", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>
            
            {/* SCROLLABLE FORM AREA */}
            <div style={{ padding: "1.5rem", overflowY: "auto" }}>
              <form onSubmit={handleSaveTrip} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Select Bus / Unit</label>
                  {buses.length === 0 ? (
                    <div style={{ padding: "0.75rem", background: "#FEF3C7", color: "#92400E", borderRadius: "8px", fontSize: "0.85rem" }}>
                      No buses available. Please add a bus first.
                    </div>
                  ) : (
                    <select className="input-field" value={formData.busId} onChange={e => setFormData({...formData, busId: e.target.value})} required style={{ appearance: "auto" }}>
                      <option value="" disabled>-- Select a Bus --</option>
                      {buses.map(bus => (
                        <option key={bus.id} value={bus.id}>
                          {bus.bus_name} ({bus.plate_number}) - {bus.capacity} Seats
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Travel Date</label>
                  <input type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                    <label>Departure Time</label>
                    <input className="input-field" value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} required />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                    <label>Arrival Time</label>
                    <input className="input-field" value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})} required />
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Fare (₱)</label>
                  <input type="number" className="input-field" value={formData.fare} onChange={e => setFormData({...formData, fare: parseInt(e.target.value)})} required />
                </div>
                
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ flex: 1, background: "#F1F5F9", color: "var(--text-main)" }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={buses.length === 0}>{isEditMode ? "Save Changes" : "Publish Trip"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE / CANCEL CONFIRMATION MODAL */}
      {isDeleteModalOpen && tripToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem", paddingBottom: "90px" }}>
          <div className="card animate-slide-up" style={{ width: "100%", maxWidth: "400px", background: "white", textAlign: "center", padding: "2rem 1.5rem" }}>
            
            <div style={{ 
              background: tripToDelete.status === 'completed' ? "#FEE2E2" : "#FEF3C7", 
              width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" 
            }}>
              <AlertTriangle size={32} color={tripToDelete.status === 'completed' ? "#EF4444" : "#D97706"} />
            </div>

            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.5rem" }}>
              {tripToDelete.status === 'completed' ? "Delete Trip Permanently?" : "Cancel Upcoming Trip?"}
            </h2>
            
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              {tripToDelete.status === 'completed' ? (
                <>Are you sure you want to <strong>permanently delete</strong> the trip for <strong>{tripToDelete.bus_name}</strong> on <strong>{tripToDelete.date}</strong>? This action cannot be undone.</>
              ) : (
                <>Are you sure you want to <strong>cancel</strong> the trip for <strong>{tripToDelete.bus_name}</strong> on <strong>{tripToDelete.date}</strong>? This will hide it from passengers but keep booking history intact.</>
              )}
            </p>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn" style={{ flex: 1, background: "#F1F5F9", color: "var(--text-main)" }}>
                Keep Trip
              </button>
              <button 
                onClick={handleDeleteTrip} 
                className="btn" 
                style={{ flex: 1, background: tripToDelete.status === 'completed' ? "#EF4444" : "#D97706", color: "white" }}
              >
                {tripToDelete.status === 'completed' ? "Delete Permanently" : "Cancel Trip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}