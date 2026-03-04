// frontend/src/components/VehicleTab.js
import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function VehicleTab({
  vehicles, setVehicles,
  selectedVehicleId, setSelectedVehicleId,
  positions, setPositions,
  onRefresh
}) {
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPlate, setEditPlate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ajouter un véhicule
  const addVehicle = async () => {
    if (!name.trim() || !plate.trim()) {
      setError("Le nom et la plaque sont requis.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/vehicles`, { name: name.trim(), plate_number: plate.trim() });
      setVehicles(prev => [...prev, res.data]);
      setName(""); setPlate("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un véhicule — FIX: on vérifie que l'id est bien défini
  const deleteVehicle = async (id) => {
    if (!id) { setError("ID du véhicule introuvable."); return; }
    if (!window.confirm("Supprimer ce véhicule et toutes ses positions ?")) return;
    setError("");
    try {
      await axios.delete(`${API}/vehicles/${id}`);
      setVehicles(prev => prev.filter(v => v.id !== id));
      setPositions(prev => prev.filter(p => p.vehicle_id !== id));
      if (selectedVehicleId === id) setSelectedVehicleId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  // Mettre à jour un véhicule
  const updateVehicle = async (id) => {
    if (!editName.trim() || !editPlate.trim()) {
      setError("Nom et plaque requis."); return;
    }
    setError("");
    try {
      const res = await axios.put(`${API}/vehicles/${id}`, { name: editName.trim(), plate_number: editPlate.trim() });
      setVehicles(prev => prev.map(v => v.id === id ? res.data : v));
      setEditId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const startEdit = (v) => {
    setEditId(v.id);
    setEditName(v.name);
    setEditPlate(v.plate_number);
    setError("");
  };

  const getVehiclePositionCount = (vehicleId) =>
    positions.filter(p => p.vehicle_id === vehicleId).length;

  return (
    <div>
      <p className="section-title">Nouveau véhicule</p>

      {error && <div className="error-msg">{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <input
          className="input-field"
          placeholder="Nom du véhicule (ex: Camion Nord)"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addVehicle()}
        />
        <input
          className="input-field"
          placeholder="Plaque (ex: AB-123-CD)"
          value={plate}
          onChange={e => setPlate(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addVehicle()}
        />
        <button className="btn btn-primary" onClick={addVehicle} disabled={loading}>
          {loading ? "Ajout..." : "+ Ajouter le véhicule"}
        </button>
      </div>

      <p className="section-title" style={{ marginTop: 20 }}>
        Flotte ({vehicles.length} véhicule{vehicles.length !== 1 ? "s" : ""})
      </p>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <div>Aucun véhicule enregistré</div>
        </div>
      ) : (
        vehicles.map(v => (
          <div
            key={v.id}
            className={`card ${selectedVehicleId === v.id ? "selected" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedVehicleId(selectedVehicleId === v.id ? null : v.id)}
          >
            {editId === v.id ? (
              // Formulaire d'édition
              <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  className="input-field"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Nom"
                />
                <input
                  className="input-field"
                  value={editPlate}
                  onChange={e => setEditPlate(e.target.value)}
                  placeholder="Plaque"
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => updateVehicle(v.id)}>✓ Sauver</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Annuler</button>
                </div>
              </div>
            ) : (
              // Affichage normal
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#e6edf3", fontSize: 14, marginBottom: 4 }}>
                    {v.name}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span className="badge badge-blue">{v.plate_number}</span>
                    <span className="badge badge-green">
                      {getVehiclePositionCount(v.id)} pos.
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" onClick={() => startEdit(v)} title="Modifier">✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteVehicle(v.id)} title="Supprimer">🗑</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}