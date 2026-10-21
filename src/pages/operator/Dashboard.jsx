import { useState, useEffect } from "react";
import { DollarSign, Users, Ticket, Bus, LogOut, Download, X, Clock, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from "papaparse";
import { operatorApi } from "../../services/operatorApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function OperatorDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [nextTrip, setNextTrip] = useState(null);
  
  const [activeModal, setActiveModal] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [statsData, chartData, reportData, tripsData] = await Promise.all([
          operatorApi.getDashboardStats(),
          operatorApi.getRevenueData(),
          operatorApi.getRevenueReportData(),
          operatorApi.getTrips()
        ]);
        
        setStats(statsData);
        setRevenueData(chartData);
        setRecentBookings(reportData.slice(0, 5));

        const today = new Date().toISOString().split("T")[0];
        const upcoming = tripsData
          .filter(t => t.date >= today && t.status === 'published')
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (upcoming.length > 0) setNextTrip(upcoming[0]);
        
      } catch (error) {
        console.error("Error loading dashboard data", error);
      }
    }
    load();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await operatorApi.getRevenueReportData();
      
      if (data.length === 0) {
        alert("No data to export yet.");
        return;
      }

      const formattedData = data.map(booking => ({
        "Reference": booking.reference,
        "Booking Date": new Date(booking.created_at).toLocaleDateString(),
        "Trip Date": booking.trips?.date || "N/A",
        "Bus": booking.trips?.bus_name || "N/A",
        "Route": `${booking.trips?.origin || ""} to ${booking.trips?.destination || ""}`,
        "Departure Time": booking.trips?.departure_time || "N/A",
        "Seats": booking.seats.join(", "),
        "Status": booking.status,
        "Total Amount (₱)": booking.total_amount
      }));

      const csv = Papa.unparse(formattedData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `BusPass_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error(error);
      alert("Failed to export report.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!stats) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading dashboard data...</div>;

  return (
    <div className="animate-slide-up" style={{ paddingBottom: "80px" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>Dashboard Overview</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Welcome back, {user?.first_name}!</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className="btn" 
            style={{ background: "white", color: "var(--primary)", border: "1px solid var(--primary)", padding: "0.5rem 1rem" }}
          >
            <Download size={16} style={{ marginRight: "6px" }} /> 
            {isExporting ? "Exporting..." : "Export Report"}
          </button>
          
          <button onClick={handleLogout} className="btn" style={{ background: "#FEE2E2", color: "#B91C1C", padding: "0.5rem 1rem" }}>
            <LogOut size={16} style={{ marginRight: "6px" }} /> Logout
          </button>
        </div>
      </div>
      
      {/* NEXT TRIP HIGHLIGHT */}
      {nextTrip && (
        <div className="card" style={{ 
          background: "linear-gradient(135deg, #0F766E 0%, #0d655e 100%)", 
          color: "white", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem"
        }}>
          <div>
            <p style={{ fontSize: "0.8rem", opacity: 0.8, textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", marginBottom: "0.5rem" }}>Next Departure</p>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>{nextTrip.bus_name}</h2>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.9 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14}/> {nextTrip.date}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14}/> {nextTrip.departure_time}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate("/operator/schedules")}
            style={{ background: "white", color: "var(--primary)", padding: "0.75rem 1.5rem", borderRadius: "12px", fontWeight: "700", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            View Schedule <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="responsive-grid" style={{ marginBottom: "2rem" }}>
        <StatCard title="Total Revenue" value={`₱${stats.totalRevenue}`} icon={<DollarSign size={24} />} color="#10B981" onClick={() => setActiveModal("revenue")} />
        <StatCard title="Confirmed Bookings" value={stats.totalBookings} icon={<Ticket size={24} />} color="#0F766E" onClick={() => setActiveModal("bookings")} />
        <StatCard title="Total Passengers" value={stats.totalPassengers} icon={<Users size={24} />} color="#F59E0B" onClick={() => setActiveModal("passengers")} />
        <StatCard title="Upcoming Trips" value={stats.upcomingTrips} icon={<Bus size={24} />} color="#3B82F6" onClick={() => setActiveModal("trips")} />
      </div>

      {/* SPLIT LAYOUT (Chart & Recent Bookings) */}
      <div className="dashboard-split-layout">
        
        {/* REVENUE CHART */}
        <div className="card" style={{ padding: "1.5rem", overflow: "hidden" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Revenue Trends</h3>
          <div style={{ height: "300px", width: "100%" }}>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value}`} />
                  <Tooltip formatter={(value) => [`₱${value}`, "Revenue"]} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--shadow-md)" }} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} dot={{ fill: "var(--primary)", strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                No revenue data yet.
              </div>
            )}
          </div>
        </div>

        {/* RECENT BOOKINGS LIST */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Recent Bookings</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700", cursor: "pointer" }} onClick={handleExport}>View All</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {recentBookings.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>No bookings yet.</p>
            ) : (
              recentBookings.map((bk, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border-color)", paddingBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ background: "#F1F5F9", padding: "8px", borderRadius: "8px", color: "var(--primary)" }}>
                      <Ticket size={16} />
                    </div>
                    <div>
                      <p style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--text-main)" }}>{bk.reference}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{bk.trips?.bus_name || "Bus"} • {bk.seats.length} seat(s)</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--primary)" }}>₱{bk.total_amount}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{new Date(bk.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem", paddingBottom: "90px" }}>
          <div className="card animate-slide-up" style={{ width: "100%", maxWidth: "500px", background: "white", padding: 0 }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>
                {activeModal === "revenue" && "Revenue Details"}
                {activeModal === "bookings" && "Booking Details"}
                {activeModal === "passengers" && "Passenger Details"}
                {activeModal === "trips" && "Trip Details"}
              </h2>
              <button onClick={() => setActiveModal(null)} style={{ background: "#F1F5F9", border: "1px solid var(--border-color)", padding: "8px", borderRadius: "50%", cursor: "pointer", color: "var(--text-main)", display: "flex" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "1.5rem", maxHeight: "60vh", overflowY: "auto" }}>
              {activeModal === "revenue" && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ background: "#D1FAE5", color: "#065F46", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}><DollarSign size={40} /></div>
                  <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary)" }}>₱{stats.totalRevenue}</h1>
                  <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Total Revenue Generated</p>
                </div>
              )}
              {activeModal === "bookings" && (
                <div style={{ textAlign: "center" }}>
                   <div style={{ background: "#CCFBF1", color: "#0F766E", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}><Ticket size={40} /></div>
                  <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--text-main)" }}>{stats.totalBookings}</h1>
                  <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Confirmed Bookings</p>
                </div>
              )}
              {activeModal === "passengers" && (
                <div style={{ textAlign: "center" }}>
                   <div style={{ background: "#FEF3C7", color: "#92400E", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}><Users size={40} /></div>
                  <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--text-main)" }}>{stats.totalPassengers}</h1>
                  <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Total Passengers Served</p>
                </div>
              )}
              {activeModal === "trips" && (
                <div style={{ textAlign: "center" }}>
                   <div style={{ background: "#DBEAFE", color: "#1E40AF", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}><Bus size={40} /></div>
                  <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--text-main)" }}>{stats.upcomingTrips}</h1>
                  <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Upcoming Trips</p>
                </div>
              )}
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border-color)", textAlign: "right" }}>
              <button className="btn btn-primary" onClick={() => setActiveModal(null)} style={{ width: "100%" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* BAG-ONG SECTION: VERIFIED TICKET HISTORY */}
      <div className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Verified Ticket History</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {recentBookings.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>No verified tickets yet.</p>
          ) : (
            recentBookings.map((bk, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ background: "#D1FAE5", color: "#065F46", padding: "8px", borderRadius: "8px" }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--text-main)" }}>{bk.reference}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{bk.trips?.bus_name || "Bus"} • {bk.trips?.date || "Date"}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-main)" }}>₱{bk.total_amount}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{bk.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, color, onClick }) {
  return (
    <div className="card" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
      <div style={{ padding: "12px", background: `${color}15`, color: color, borderRadius: "12px" }}>{icon}</div>
      <div>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: "600" }}>{title}</p>
        <p style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>{value}</p>
      </div>
    </div>
  );
}