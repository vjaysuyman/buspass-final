import { useState, useEffect } from "react";
import { Bus as BusIcon, Plus, X, AlertCircle, Edit, Trash2, AlertTriangle } from "lucide-react";
import { operatorApi } from "../../services/operatorApi";

export default function Buses() {
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [busToDelete, setBusToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    bus_name: "",
    plate_number: "",
    capacity: 20
  });

  const loadBuses = async () => {
    setIsLoading(true);
    try {
      const data = await operatorApi.getBuses();
      setBuses(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedBusId(null);
    setFormData({ bus_name: "", plate_number: "", capacity: 20 });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (bus) => {
    setIsEditMode(true);
    setSelectedBusId(bus.id);
    setFormData({
      bus_name: bus.bus_name,
      plate_number: bus.plate_number,
      capacity: bus.capacity
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSaveBus = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (isEditMode) {
        await operatorApi.updateBus(selectedBusId, formData);
      } else {
        await operatorApi.createBus(formData);
      }
      setIsModalOpen(false);
      loadBuses();
    } catch (error) {
      setErrorMsg(`Failed to ${isEditMode ? "update" : "add"} bus. Plate number might already exist.`);
    }
  };

  const handleDeleteBus = async () => {
    if (!busToDelete) return;
    try {
      await operatorApi.deleteBus(busToDelete.id);
      setIsDeleteModalOpen(false);
      setBusToDelete(null);
      loadBuses();
    } catch (error) {
      console.error(error);
      alert("Failed to delete bus. It might be assigned to an existing trip.");
    }
  };

  return (
    <div className="animate-slide-up">
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Fleet Management</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Manage your registered buses.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} style={{ padding: "0.6rem 1rem" }}>
          <Plus size={18} style={{ marginRight: "6px" }} /> Add Bus
        </button>
      </div>

      {/* BUS LIST */}
      {isLoading ? (
        <p>Loading fleet...</p>
      ) : buses.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <BusIcon size={48} style={{ opacity: 0.2, margin: "0 auto 1rem auto" }} />
          <h3>No buses registered yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Click "Add Bus" to start building your fleet.</p>
        </div>
      ) : (
        <div className="responsive-grid">
          {buses.map(bus => (
            <div key={bus.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              
              {/* Card Content */}
              <div style={{ padding: "1.25rem", flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ background: "#F1F5F9", padding: "16px", borderRadius: "12px", color: "var(--primary)", flexShrink: 0 }}>
                  <BusIcon size={32} />
                </div>
                <div>
                  <h3 style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--text-main)" }}>{bus.bus_name}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>Plate: <strong>{bus.plate_number}</strong></p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Capacity: {bus.capacity} Seats</p>
                </div>
              </div>

              {/* Card Footer (Actions) */}
              <div style={{ padding: "0.75rem 1.25rem", background: "#F8FAFC", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button onClick={() => openEditModal(bus)} style={{ background: "white", border: "1px solid var(--border-color)", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: "600" }}>
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => { setBusToDelete(bus); setIsDeleteModalOpen(true); }} style={{ background: "#FEE2E2", border: "1px solid #FECACA", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "#B91C1C", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: "600" }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
          <div className="card animate-slide-up" style={{ width: "100%", maxWidth: "400px", background: "white", padding: 0 }}>
            
            {/* Modal Header */}
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{isEditMode ? "Edit Bus" : "Add New Bus"}</h2>
              
              {/* X BUTTON GIPASIGURO NGA MAKLARO */}
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ 
                  background: "#F1F5F9", 
                  border: "1px solid var(--border-color)", 
                  padding: "8px", 
                  borderRadius: "50%", 
                  cursor: "pointer", 
                  color: "var(--text-main)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center" 
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBus} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {errorMsg && <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", display: "flex", gap: "6px" }}><AlertCircle size={16}/>{errorMsg}</div>}
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Bus Name / Model</label>
                <input className="input-field" placeholder="e.g. BUSPASS Aircon 3" value={formData.bus_name} onChange={e => setFormData({...formData, bus_name: e.target.value})} required />
              </div>
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Plate Number</label>
                <input className="input-field" placeholder="e.g. ABC-123" value={formData.plate_number} onChange={e => setFormData({...formData, plate_number: e.target.value})} required />
              </div>
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Seat Capacity</label>
                <input type="number" className="input-field" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>{isEditMode ? "Save Changes" : "Save Bus"}</button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && busToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
          <div className="card animate-slide-up" style={{ width: "100%", maxWidth: "400px", background: "white", textAlign: "center", padding: "2rem 1.5rem" }}>
            <div style={{ background: "#FEE2E2", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.5rem" }}>Delete Bus?</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Are you sure you want to remove <strong>{busToDelete.bus_name}</strong> ({busToDelete.plate_number})? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn" style={{ flex: 1, background: "#F1F5F9", color: "var(--text-main)" }}>Cancel</button>
              <button onClick={handleDeleteBus} className="btn" style={{ flex: 1, background: "#EF4444", color: "white" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}