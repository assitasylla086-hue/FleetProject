// frontend/src/components/PositionTab.js
import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function PositionTab({ positions, vehicles, onRefresh }) {
  const [vehicleId, setVehicleId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("all");

  const addPosition = async () => {
    if (!vehicleId || !latitude || !longitude) {
      setError("Tous les champs sont requis.");
      return;
    }
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await axios.post(`${API}/positions`, {
        vehicle_id: parseInt(vehicleId),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      });
      setSuccess("Position enregistrée !");
      setLatitude(""); setLongitude("");
      onRefresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      () => setError("Impossible d'obtenir la position GPS.")
    );
  };

  const filtered = filterVehicle === "all"
    ? positions
    : positions.filter(p => p.vehicle_id === parseInt(filterVehicle));

  return (
    <div>
      <p className="section-title">Enregistrer une position</p>

      {error && <div className="error-msg">{error}</div>}
      {success && (
        <div style={{ background: "rgba(0,210,140,0.1)", border: "1px solid rgba(0,210,140,0.3)", borderRadius: 8, padding: "10px 12px", color: "#00d28c", fontSize: 13, marginBottom: 12 }}>
          ✓ {success}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <select
          className="input-field"
          value={vehicleId}
          onChange={e => setVehicleId(e.target.value)}
        >
          <option value="">— Sélectionner un véhicule —</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <input className="input-field" placeholder="Latitude" value={latitude} onChange={e => setLatitude(e.target.value)} />
          <input className="input-field" placeholder="Longitude" value={longitude} onChange={e => setLongitude(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={useMyLocation} style={{ flex: 1 }}>
            📡 Ma position GPS
          </button>
          <button className="btn btn-primary" onClick={addPosition} disabled={loading} style={{ flex: 1 }}>
            {loading ? "..." : "📍 Enregistrer"}
          </button>
        </div>
      </div>

      {/* Filtre */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <p className="section-title" style={{ margin: 0, flex: 1 }}>
          Historique ({filtered.length})
        </p>
        <select
          className="input-field"
          style={{ width: "auto", padding: "5px 10px", fontSize: 12 }}
          value={filterVehicle}
          onChange={e => setFilterVehicle(e.target.value)}
        >
          <option value="all">Tous</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📍</div>
          <div>Aucune position enregistrée</div>
        </div>
      ) : (
        [...filtered].reverse().map((p, idx) => (
          <div key={idx} className="card" style={{ padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#e6edf3" }}>{p.name}</span>
                <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 10 }}>{p.plate_number}</span>
              </div>
              <span style={{ fontSize: 11, color: "#484f58" }}>
                {new Date(p.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
            <div style={{ marginTop: 5, fontSize: 12, color: "#8b949e", fontFamily: "'Space Mono', monospace" }}>
              {Number(p.latitude).toFixed(5)}, {Number(p.longitude).toFixed(5)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}